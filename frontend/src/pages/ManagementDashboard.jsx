import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import api from "../api";
import AssignContractorModal from "./AssignContractorModal";

const STATUS_STYLES = {
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  DONE: "bg-green-100 text-green-800",
};

const ManagementDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignTicketId, setAssignTicketId] = useState(null);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/tickets");
      setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const countByStatus = (status) =>
    tickets.filter((t) => t.status === status).length;

  const avgResolutionHrs = () => {
    const done = tickets.filter(
      (t) => t.status === "DONE" && t.createdAt && t.updatedAt
    );
    if (!done.length) return "—";
    const avg =
      done.reduce((sum, t) => {
        const hrs =
          (new Date(t.updatedAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
        return sum + hrs;
      }, 0) / done.length;
    return `${avg.toFixed(1)} hrs`;
  };

  const renderPhoto = (photoUrls) => {
    if (photoUrls && photoUrls[0]) {
      return (
        <a>
          href={photoUrls[0]}
          target="_blank"
          rel="noreferrer"
          className="text-[#005035] font-bold text-xs hover:underline"
          View
        </a>
      );
    }
    return <span className="text-gray-300 text-xs">—</span>;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role="management" userName="Admin User" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#005035] text-white p-6 shadow-md">
          <h1 className="text-2xl font-bold">Campus Operations Dashboard</h1>
        </header>

        <main className="p-8 space-y-8 overflow-y-auto">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Avg. Resolution Time", val: avgResolutionHrs(), color: "text-[#005035]" },
              { label: "Unassigned Tickets", val: countByStatus("OPEN"), color: "text-red-600" },
              { label: "In Progress", val: countByStatus("IN_PROGRESS"), color: "text-[#A49665]" },
              { label: "Resolved", val: countByStatus("DONE"), color: "text-gray-700" },
            ].map((m, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-[#A49665]">
                <p className="text-xs font-bold text-gray-400 uppercase">{m.label}</p>
                <p className={`text-3xl font-black mt-2 ${m.color}`}>{m.val}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800">All Tickets</h3>
              <button
                onClick={fetchTickets}
                className="text-xs bg-gray-100 px-3 py-1 rounded-md font-bold text-gray-600 hover:bg-gray-200 transition"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="p-6 text-gray-400 text-sm">Loading tickets…</p>
            ) : tickets.length === 0 ? (
              <p className="p-6 text-gray-400 text-sm">No tickets yet.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Assigned To</th>
                    <th className="p-4">Photo</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-mono text-[#005035]">
                        #{String(ticket.id).slice(0, 6).toUpperCase()}
                      </td>
                      <td className="p-4 font-semibold text-gray-800 max-w-[200px] truncate">
                        {ticket.title}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            ticket.priority === "HIGH"
                              ? "bg-red-100 text-red-700"
                              : ticket.priority === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            STATUS_STYLES[ticket.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {ticket.assignedTo ?? "Unassigned"}
                      </td>
                      <td className="p-4">
                        {renderPhoto(ticket.photoUrls)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setAssignTicketId(ticket.id)}
                          className="bg-white border-2 border-gray-100 text-gray-600 hover:border-[#A49665] hover:text-[#A49665] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </main>
      </div>

      {assignTicketId && (
        <AssignContractorModal
          ticketId={assignTicketId}
          onClose={() => setAssignTicketId(null)}
          onAssigned={() => {
            setAssignTicketId(null);
            fetchTickets();
          }}
        />
      )}
    </div>
  );
};

export default ManagementDashboard;
