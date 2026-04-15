import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import api from "../api";

const NEXT_STATUS = {
  OPEN:        "IN_PROGRESS",
  IN_PROGRESS: "DONE",
};

const STATUS_LABEL = {
  OPEN:        "Start Job",
  IN_PROGRESS: "Mark Done",
};

const ContractorDashboard = () => {
  const username     = (localStorage.getItem("email") || "").split("@")[0] || "User";
  const contractorId = localStorage.getItem("contractorId") || localStorage.getItem("userId");

  const [tickets,   setTickets]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [updating,  setUpdating]  = useState(null); // ticket id currently being updated

  const fetchTickets = async () => {
    try {
      const { data } = await api.get(`/tickets?contractorId=${contractorId}`);
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

  const handleStatusUpdate = async (ticket) => {
    const next = NEXT_STATUS[ticket.status];
    if (!next) return;
    setUpdating(ticket.id);
    try {
      await api.patch(`/tickets/${ticket.id}`, { status: next });
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: next } : t))
      );
    } catch (err) {
      console.error("Failed to update ticket:", err);
      alert("Could not update ticket status.");
    } finally {
      setUpdating(null);
    }
  };

  const active   = tickets.find((t)  => t.status === "IN_PROGRESS");
  const queue    = tickets.filter((t) => t.status === "OPEN");
  const finished = tickets.filter((t) => t.status === "DONE");

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="contractor" userName={username} />


        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <p className="text-gray-400 text-sm">Loading your assignments…</p>
          ) : (
            <>
              {/* Active job */}
              <div className="bg-white border-2 border-[#A49665] rounded-2xl p-6 shadow-sm">
                <span className="text-xs font-black text-[#A49665] uppercase">
                  Current Assignment
                </span>
                {active ? (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">
                      {active.title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{active.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4 mt-4">
                      <div>
                        <p className="text-gray-400">Priority</p>
                        <p
                          className={`font-semibold ${
                            active.priority === "HIGH" ? "text-red-600" : "text-gray-700"
                          }`}
                        >
                          {active.priority}
                        </p>
                      </div>
                     
                      {active.photoUrls && active.photoUrls.length > 0 && (
                        <div>
                          <p className="text-gray-400 mb-2">Photos</p>
                            <div className="flex flex-wrap gap-2">
                              {active.photoUrls.map((url, index) => (
                                <a key={index} href={url} target="_blank" rel="noreferrer">
                                  <img src={url} alt="ticket" className="w-24 h-24 object-cover rounded-lg hover:opacity-80 transition" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    <button
                      onClick={() => handleStatusUpdate(active)}
                      disabled={updating === active.id}
                      className="mt-4 bg-[#005035] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#00402a] transition disabled:opacity-50"
                    >
                      {updating === active.id ? "Updating…" : "Mark Done"}
                    </button>
                  </>
                ) : (
                  <p className="text-gray-400 mt-2 text-sm">No active job right now.</p>
                )}
              </div>

              {/* Queue */}
              <section>
                <h3 className="font-bold text-gray-700 mb-3 text-lg">
                  Upcoming Tasks ({queue.length})
                </h3>
                {queue.length === 0 ? (
                  <p className="text-gray-400 text-sm">No tasks in queue.</p>
                ) : (
                  <div className="space-y-3">
                    {queue.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center gap-4"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-gray-700 truncate">{ticket.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {ticket.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleStatusUpdate(ticket)}
                          disabled={updating === ticket.id || !!active}
                          className="shrink-0 bg-[#005035] text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-[#00402a] transition disabled:opacity-40"
                          title={active ? "Finish current job first" : ""}
                        >
                          {updating === ticket.id ? "…" : STATUS_LABEL[ticket.status]}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Completed */}
              {finished.length > 0 && (
                <section>
                  <h3 className="font-bold text-gray-700 mb-3 text-lg">
                    Completed ({finished.length})
                  </h3>
                  <div className="space-y-2">
                    {finished.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-white p-4 rounded-xl border flex justify-between items-center opacity-60"
                      >
                        <p className="font-semibold text-gray-600 truncate">{ticket.title}</p>
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                          DONE
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
  );
};

export default ContractorDashboard;