import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";

const ROLE_LABELS = {
  student: { name: "Student", color: "#005035" },
  contractor: { name: "Contractor", color: "#A49665" },
  management: { name: "Management", color: "#1f2937" },
};

const AuthForm = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleInfo = ROLE_LABELS[role];

  if (!roleInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Unknown role. <Link className="text-[#005035] underline" to="/signin">Back to portal selection</Link></p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const { data } = await api.post(endpoint, { email, password, role });
      if (data.token) localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", String(data.id));
      localStorage.setItem("email", data.email);
      navigate(`/${data.role}`);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setError("Invalid email or password.");
      else if (status === 409) setError("An account with that email already exists.");
      else if (status === 400) setError("Please fill in all fields.");
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: roleInfo.color }}>
          {roleInfo.name} Portal
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          {mode === "login" ? "Sign in to continue" : "Create a new account"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border-t-8"
        style={{ borderTopColor: roleInfo.color }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#005035] focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#005035] focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl text-white font-bold transition-opacity disabled:opacity-60"
            style={{ backgroundColor: roleInfo.color }}
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={() => { setError(""); setMode(mode === "login" ? "signup" : "login"); }}
            className="w-full text-sm text-gray-600 hover:text-gray-900"
          >
            {mode === "login"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>

          <Link to="/signin" className="block text-center text-xs text-gray-400 hover:text-gray-600 mt-2">
            ← Back to portal selection
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
