import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../api";

const ApiTesting = () => {
  const [students, setStudents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [ticketsError, setTicketsError] = useState("");

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      setStudentsError("");
      const response = await api.get("/students");
      setStudents(response.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudentsError("Failed to load students.");
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setTicketsLoading(true);
      setTicketsError("");
      const response = await api.get("/tickets");
      setTickets(response.data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTicketsError("Failed to load tickets.");
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchTickets();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>API Testing</h2>

      <div style={{ marginBottom: "2rem" }}>
        <h3>Students</h3>
        <button onClick={fetchStudents} disabled={studentsLoading}>
          {studentsLoading ? "Loading Students..." : "Refresh Students"}
        </button>

        {studentsError && <p>{studentsError}</p>}

        {!studentsLoading && !studentsError && students.length === 0 && (
          <p>No students found.</p>
        )}

        {students.length > 0 && (
          <ul>
            {students.map((student) => (
              <li key={student.studentId}>
                <strong>ID:</strong> {student.studentId} |{" "}
                <strong>Email:</strong> {student.email} |{" "}
                <strong>Created:</strong> {student.createdAt}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3>Tickets</h3>
        <button onClick={fetchTickets} disabled={ticketsLoading}>
          {ticketsLoading ? "Loading Tickets..." : "Refresh Tickets"}
        </button>

        {ticketsError && <p>{ticketsError}</p>}

        {!ticketsLoading && !ticketsError && tickets.length === 0 && (
          <p>No tickets found.</p>
        )}

        {tickets.length > 0 && (
          <ul>
            {tickets.map((ticket) => (
              <li key={ticket.ticketId}>
                <strong>ID:</strong> {ticket.ticketId} |{" "}
                <strong>Title:</strong> {ticket.title || "N/A"} |{" "}
                <strong>Status:</strong> {ticket.status || "N/A"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ApiTesting;