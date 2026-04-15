import React, { useState, useEffect } from "react";
import Sidebar from "../pages/Sidebar";
import api from "../api";

const StudentDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState([]);

  const username = (localStorage.getItem("email") || "").split("@")[0] || "User";
  const studentId = localStorage.getItem("studentId") || localStorage.getItem("userId") || "1";

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        const { data } = await api.get(`/tickets?studentId=${studentId}`);
        setTickets(data);
      } catch (err) {
        console.error("Failed to load tickets!", err);
      
      }
    };
    fetchMyTickets();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const uploadFileToS3 = async (file) => {
    const { data: presignData } = await api.post("/upload/presign", {
      fileName: file.name,
      contentType: file.type,
    });

    await fetch(presignData.uploadURL, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    return presignData.cdnURL;
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const title = e.target.title.value;
      const description = e.target.description.value;
      const priority = e.target.priority.value;

      let photoUrls = [];

      if (selectedFile) {
        const cdnURL = await uploadFileToS3(selectedFile);
        photoUrls = [cdnURL];
      }

      const ticketData = {
        title,
        description,
        status: "OPEN",
        priority,
        photoUrls,
      };

      const { data } = await api.post(`/tickets?studentId=${studentId}`, ticketData);

      console.log("Created ticket:", data);
      alert("Ticket submitted successfully!");

      const { data: updated } = await api.get(`/tickets?studentId=${studentId}`);
      setTickets(updated);

      setSelectedFile(null);
      setShowModal(false);
      e.target.reset();
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("Failed to submit ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar role="student" userName={username} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b-2 border-gray-100 p-4 flex justify-between items-center shadow-sm">
          <h1 className="text-lg font-bold text-[#005035]">
            University of North Carolina at Charlotte
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">{username}</span>
            <div className="w-10 h-10 rounded-full bg-[#005035] flex items-center justify-center text-white font-bold">
              {username.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">
                  Good morning, {username}
                </h2>
                <p className="text-gray-500 mt-1">
                  Here is your current ticket status overview.
                </p>
              </div>

              <div className="flex gap-4">
                {[
                  { label: "OPEN", count: tickets.filter((t) => t.status === "OPEN").length, color: "border-blue-500" },
                  { label: "ACTIVE", count: tickets.filter((t) => t.status === "IN_PROGRESS").length , color: "border-[#A49665]" },
                  { label: "DONE", count: tickets.filter((t) => t.status === "DONE").length, color: "border-[#005035]" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`bg-white border-b-4 ${stat.color} shadow-md p-4 w-24 text-center rounded-2xl transition-transform hover:-translate-y-1`}
                  >
                    <div className="text-2xl font-black text-gray-800">{stat.count}</div>
                    <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <section className="bg-[#005035] rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#A49665] opacity-20 blur-3xl rounded-full"></div>

              <h3 className="text-3xl font-black text-white mb-3 tracking-tight uppercase">
                Submit Issues
              </h3>
              <p className="text-green-100 mb-10 max-w-md mx-auto font-medium opacity-90">
                Click below to submit a ticket with photos. Our maintenance team will be notified immediately.
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-black py-6 px-16 rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.4)] transform transition-all hover:scale-105 active:scale-95 text-xl tracking-wider"
              >
                SUBMIT NEW TICKET
              </button>
            </section>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-10 shadow-2xl">
            <h2 className="text-3xl font-black text-[#005035] mb-2 tracking-tight">
              New Support Ticket
            </h2>
            <p className="text-gray-500 mb-8 font-medium">
              Please provide details and any helpful photos.
            </p>

            <form onSubmit={handleTicketSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Title
                </label>
                <input
                  name="title"
                  required
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[#A49665] focus:ring-4 focus:ring-[#A49665]/10 outline-none transition-all"
                  placeholder="Example: AC making loud noise"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Issue Description
                </label>
                <textarea
                  name="description"
                  required
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[#A49665] focus:ring-4 focus:ring-[#A49665]/10 outline-none transition-all resize-none"
                  rows="4"
                  placeholder="Example: The AC in room 204 is making a loud rattling noise..."
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  defaultValue="MEDIUM"
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-[#A49665] focus:ring-4 focus:ring-[#A49665]/10 outline-none transition-all"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Upload Photo
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#005035] transition-colors cursor-pointer group">
                  <input
                    type="file"
                    className="hidden"
                    id="fileUpload"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <span className="text-sm font-bold text-gray-500 group-hover:text-[#005035]">
                      {selectedFile ? selectedFile.name : "Click to select file"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  type="button"
                  className="flex-1 py-4 text-gray-400 font-bold hover:text-gray-600 transition"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-[#005035] text-white font-black rounded-2xl shadow-xl hover:bg-[#00402a] transition-all transform hover:-translate-y-1 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;