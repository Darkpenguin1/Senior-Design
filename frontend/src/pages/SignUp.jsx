import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { signup } from '../api/client';

const ROLE_LABELS = {
  student: 'Student',
  contractor: 'Contractor',
  management: 'Management',
};

const SignUp = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const label = ROLE_LABELS[role] || 'User';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (role === 'student' || role === 'management') {
      const domain = email.split('@')[1]?.toLowerCase();
      if (domain !== 'uncc.edu' && domain !== 'charlotte.edu') {
        setError(`${label} accounts must use a uncc.edu or charlotte.edu email address.`);
        return;
      }
    }
    setLoading(true);
    try {
      const data = await signup({ email, password, role });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user_id', data.user_id);
      navigate(`/${data.role}`);
    } catch (err) {
      setError(err.message || 'Sign up failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-[#005035] tracking-tight">{label} Sign Up</h1>
        <p className="text-gray-500 font-medium">Create a new account</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border-t-8 border-[#A49665]"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Create account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#005035]"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#005035]"
        />

        <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-200 rounded-xl focus:outline-none focus:border-[#005035]"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-[#005035] text-white font-bold rounded-xl hover:bg-[#003b27] transition disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Sign Up'}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to={`/login/${role}`} className="text-[#005035] font-semibold hover:underline">
            Log in
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-gray-400">
          <Link to="/signin" className="hover:underline">← Back to portals</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
