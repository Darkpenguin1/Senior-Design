import React, { useMemo, useState } from "react";
import "./ManagementDashboard.css";

function ManagementDashboard() {
  const [contractors, setContractors] = useState([
    { id: 1, name: "James", location: "Smith Hall", clockedIn: true, currentTickets: 2 },
    { id: 2, name: "Frank", location: "Fretwell", clockedIn: true, currentTickets: 1 },
    { id: 3, name: "Ivan", location: "Smith Hall", clockedIn: false, currentTickets: 0 },
    { id: 4, name: "Amman", location: "Woodward", clockedIn: true, currentTickets: 3 },
    { id: 5, name: "Zach", location: "Fretwell", clockedIn: true, currentTickets: 0 },
  ]);

  const [tickets, setTickets] = useState([
    {
      id: 1001,
      category: "Electrical",
      location: "Smith Hall",
      description: "Outlet sparks when plugging in laptop charger.",
      urgency: "High",
      status: "Submitted",
      assignedContractor: null,
      createdAt: "2026-04-05T09:00:00",
    },
    {
      id: 1002,
      category: "Plumbing",
      location: "Fretwell",
      description: "Sink leaking under cabinet in restroom.",
      urgency: "Medium",
      status: "Submitted",
      assignedContractor: null,
      createdAt: "2026-04-05T08:15:00",
    },
    {
      id: 1003,
      category: "HVAC",
      location: "Woodward",
      description: "AC not cooling classroom 204.",
      urgency: "High",
      status: "In Progress",
      assignedContractor: null,
      createdAt: "2026-04-04T16:20:00",
    },
    {
      id: 1004,
      category: "General Maintenance",
      location: "Smith Hall",
      description: "Broken chair in study room.",
      urgency: "Low",
      status: "Submitted",
      assignedContractor: null,
      createdAt: "2026-04-05T10:45:00",
    },
    {
      id: 1005,
      category: "Electrical",
      location: "Fretwell",
      description: "Hallway lights flickering on second floor.",
      urgency: "Medium",
      status: "Completed",
      assignedContractor: null,
      createdAt: "2026-04-03T13:30:00",
    },
  ]);

  const [statusFilter, setStatusFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [manualSelections, setManualSelections] = useState({});

  const urgencyRank = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const locations = useMemo(() => {
    const uniqueLocations = new Set(tickets.map((ticket) => ticket.location));
    return ["All", ...Array.from(uniqueLocations)];
  }, [tickets]);

  const summary = useMemo(() => {
    return {
      submitted: tickets.filter((ticket) => ticket.status === "Submitted").length,
      inProgress: tickets.filter((ticket) => ticket.status === "In Progress").length,
      completed: tickets.filter((ticket) => ticket.status === "Completed").length,
      unassigned: tickets.filter((ticket) => !ticket.assignedContractor).length,
    };
  }, [tickets]);

  const visibleTickets = useMemo(() => {
    let filtered = [...tickets];

    if (statusFilter !== "All") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter);
    }

    if (urgencyFilter !== "All") {
      filtered = filtered.filter((ticket) => ticket.urgency === urgencyFilter);
    }

    if (locationFilter !== "All") {
      filtered = filtered.filter((ticket) => ticket.location === locationFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === "Newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      if (sortBy === "Oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "Urgency") {
        return urgencyRank[b.urgency] - urgencyRank[a.urgency];
      }

      if (sortBy === "Unassigned First") {
        const aUnassigned = a.assignedContractor ? 1 : 0;
        const bUnassigned = b.assignedContractor ? 1 : 0;
        return aUnassigned - bUnassigned;
      }

      return 0;
    });

    return filtered;
  }, [tickets, statusFilter, urgencyFilter, locationFilter, sortBy]);

  function updateContractorLoad(contractorName, changeAmount) {
    setContractors((prevContractors) =>
      prevContractors.map((contractor) =>
        contractor.name === contractorName
          ? {
              ...contractor,
              currentTickets: Math.max(0, contractor.currentTickets + changeAmount),
            }
          : contractor
      )
    );
  }

  function assignTicket(ticketId, contractorName) {
    const ticketToUpdate = tickets.find((ticket) => ticket.id === ticketId);
    if (!ticketToUpdate) return;

    const previousAssignee = ticketToUpdate.assignedContractor;

    if (previousAssignee && previousAssignee !== contractorName) {
      updateContractorLoad(previousAssignee, -1);
    }

    if (!previousAssignee || previousAssignee !== contractorName) {
      updateContractorLoad(contractorName, 1);
    }

    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              assignedContractor: contractorName,
              status: ticket.status === "Submitted" ? "In Progress" : ticket.status,
            }
          : ticket
      )
    );
  }

  function autoAssignByLocation(ticket) {
    const matchingContractors = contractors
      .filter(
        (contractor) =>
          contractor.clockedIn &&
          contractor.location === ticket.location
      )
      .sort((a, b) => a.currentTickets - b.currentTickets);

    if (matchingContractors.length === 0) {
      alert(`No clocked-in contractors available for ${ticket.location}.`);
      return;
    }

    assignTicket(ticket.id, matchingContractors[0].name);
  }

  function autoAssignLeastLoaded(ticket) {
    const availableContractors = contractors
      .filter((contractor) => contractor.clockedIn)
      .sort((a, b) => a.currentTickets - b.currentTickets);

    if (availableContractors.length === 0) {
      alert("No clocked-in contractors are currently available.");
      return;
    }

    assignTicket(ticket.id, availableContractors[0].name);
  }

  function handleManualSelection(ticketId, contractorName) {
    setManualSelections((prev) => ({
      ...prev,
      [ticketId]: contractorName,
    }));
  }

  function assignManually(ticketId) {
    const selectedContractor = manualSelections[ticketId];

    if (!selectedContractor) {
      alert("Please select a contractor first.");
      return;
    }

    assignTicket(ticketId, selectedContractor);
  }

  function updateTicketStatus(ticketId, newStatus) {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status: newStatus }
          : ticket
      )
    );
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
  }

  return (
    <div className="management-page">
      <header className="management-header">
        <h1>Management Dashboard</h1>
        <p>Review requests, filter the queue, and assign contractors.</p>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <h3>Submitted</h3>
          <p>{summary.submitted}</p>
        </div>
        <div className="summary-card">
          <h3>In Progress</h3>
          <p>{summary.inProgress}</p>
        </div>
        <div className="summary-card">
          <h3>Completed</h3>
          <p>{summary.completed}</p>
        </div>
        <div className="summary-card">
          <h3>Unassigned</h3>
          <p>{summary.unassigned}</p>
        </div>
      </section>

      <section className="controls-panel">
        <div className="control-group">
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Submitted</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="control-group">
          <label>Urgency</label>
          <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div className="control-group">
          <label>Location</label>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option>Newest</option>
            <option>Oldest</option>
            <option>Urgency</option>
            <option>Unassigned First</option>
          </select>
        </div>
      </section>

      <section className="contractor-panel">
        <h2>Available Contractors</h2>
        <div className="contractor-list">
          {contractors.map((contractor) => (
            <div key={contractor.id} className="contractor-card">
              <h4>{contractor.name}</h4>
              <p><strong>Location:</strong> {contractor.location}</p>
              <p><strong>Clocked In:</strong> {contractor.clockedIn ? "Yes" : "No"}</p>
              <p><strong>Current Tickets:</strong> {contractor.currentTickets}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="queue-section">
        <h2>Work Order Queue</h2>

        {visibleTickets.length === 0 ? (
          <p className="empty-message">No tickets match the current filters.</p>
        ) : (
          <div className="ticket-list">
            {visibleTickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-top">
                  <div>
                    <h3>Ticket #{ticket.id}</h3>
                    <p className="ticket-meta">
                      {ticket.category} • {ticket.location}
                    </p>
                  </div>
                  <div className="ticket-badges">
                    <span className={`badge urgency-${ticket.urgency.toLowerCase()}`}>
                      {ticket.urgency}
                    </span>
                    <span className={`badge status-${ticket.status.toLowerCase().replace(" ", "-")}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>

                <p className="ticket-description">{ticket.description}</p>

                <div className="ticket-details">
                  <p><strong>Assigned To:</strong> {ticket.assignedContractor || "Unassigned"}</p>
                  <p><strong>Created:</strong> {formatDate(ticket.createdAt)}</p>
                </div>

                <div className="ticket-actions">
                  <button onClick={() => autoAssignByLocation(ticket)}>
                    Auto Assign by Location
                  </button>

                  <button onClick={() => autoAssignLeastLoaded(ticket)}>
                    Auto Assign Least Loaded
                  </button>

                  <select
                    value={manualSelections[ticket.id] || ""}
                    onChange={(e) => handleManualSelection(ticket.id, e.target.value)}
                  >
                    <option value="">Select contractor</option>
                    {contractors
                      .filter((contractor) => contractor.clockedIn)
                      .map((contractor) => (
                        <option key={contractor.id} value={contractor.name}>
                          {contractor.name} ({contractor.location}, {contractor.currentTickets} tickets)
                        </option>
                      ))}
                  </select>

                  <button onClick={() => assignManually(ticket.id)}>
                    Assign Manually
                  </button>

                  <button onClick={() => updateTicketStatus(ticket.id, "In Progress")}>
                    Set In Progress
                  </button>

                  <button onClick={() => updateTicketStatus(ticket.id, "Completed")}>
                    Mark Completed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ManagementDashboard;