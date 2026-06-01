
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login(form.username, form.password);

      // Add this console.log temporarily to see the exact shape
      console.log("Login response:", response);

      const role =
        response?.role ||           // if AuthContext returns user directly
        response?.data?.role ||     // if AuthContext returns res.data
        response?.data?.data?.role; // if AuthContext returns full axios response

      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (role === "AGENT") {
        navigate("/agent/dashboard");
      } else if (role === "USER") {
        navigate("/user/dashboard");
      } else if (role === "CUSTOMER") {
        navigate("/user/dashboard");
      } else {
        setError("Invalid role or login response");
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };


  return (
    <div className="relative min-h-screen bg-gray-100 flex items-center justify-center p-4  bg-gradient-to-r from-indigo-500 to-purple-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-lg w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <div >
            <div className=" text-sm font-bold text-gray-800 ">ChitFund Pro</div>
            <div className="text-xs text-gray-400">Collection Management</div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-400 mb-6">Sign in to your account</p>

        {
          error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )
        }

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Username</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="admin or agent1"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-600 mb-1">Default credentials:</p>
          <p>Admin: <span className="font-mono text-gray-700">admin / admin@123</span></p>
          <p>Agent: <span className="font-mono text-gray-700">agent1 / agent@123</span></p>
        </div>
      </div >
    </div >

  );
}
