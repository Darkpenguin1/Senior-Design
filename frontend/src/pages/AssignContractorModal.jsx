import React, { useEffect, useState } from 'react';
import api from '../api';

const AssignContractorModal = ({ ticketId, onClose, onAssigned }) => {
  const [contractors, setContractors] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    api
      .get('/contractors')
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setContractors(
          list.map((c) => ({
            id: c.id,
            name: c.name ?? '—',
            location: c.location ?? '—',
            clockedIn: Boolean(c.clockedIn),
          }))
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setFetchError(err?.response?.data?.message || 'Failed to load contractors.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data: ticket } = await api.get(`/tickets/${ticketId}`);
      await api.put(`/tickets/${ticketId}?contractorId=${selectedId}`, {
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        photoUrls: ticket.photoUrls,
        priority: ticket.priority,
      });
      const chosen = contractors.find((c) => c.id === selectedId);
      onAssigned?.(chosen);
      onClose?.();
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Failed to assign contractor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] max-w-2xl w-full p-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-black text-[#005035] mb-2 tracking-tight">
          Assign Contractor
        </h2>
        <p className="text-gray-500 mb-8 font-medium">
          Select a contractor to assign to this ticket.
        </p>

        <div className="max-h-96 overflow-y-auto border rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] sticky top-0">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={3}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && fetchError && (
                <tr>
                  <td className="p-4 text-red-600" colSpan={3}>
                    {fetchError}
                  </td>
                </tr>
              )}
              {!loading && !fetchError && contractors.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={3}>
                    No contractors found.
                  </td>
                </tr>
              )}
              {!loading &&
                !fetchError &&
                contractors.map((c) => {
                  const selected = c.id === selectedId;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`cursor-pointer transition-colors ${
                        selected
                          ? 'bg-[#005035]/10 border-l-4 border-[#A49665]'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="p-4 font-semibold text-gray-800">{c.name}</td>
                      <td className="p-4 text-gray-500">{c.location}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            c.clockedIn
                              ? 'bg-green-100 text-[#005035]'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {c.clockedIn ? 'CLOCKED IN' : 'OFF DUTY'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {submitError && (
          <p className="text-red-600 text-sm mt-4">{submitError}</p>
        )}

        <div className="flex gap-4 pt-6">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-gray-400 font-bold hover:text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedId || submitting}
            className="flex-1 py-4 bg-[#005035] text-white font-black rounded-2xl shadow-xl hover:bg-[#00402a] transition-all disabled:opacity-50"
          >
            {submitting ? 'Assigning…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignContractorModal;
