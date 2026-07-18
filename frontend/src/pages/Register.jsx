import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const res = await api.post("/auth/register", form);
      login(res.data);
      toast.success("Registration successful");
      navigate("/report");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100svh-73px)] items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-normal text-teal-700">
            Create account
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Register
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Join the community reporting network.
          </p>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Name
            <input
              className="rounded-md border border-slate-300 bg-white px-3 py-3 font-normal text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Email
            <input
              className="rounded-md border border-slate-300 bg-white px-3 py-3 font-normal text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Password
            <input
              className="rounded-md border border-slate-300 bg-white px-3 py-3 font-normal text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-70"
          >
            {loading ? "Creating account" : "Register"}
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link className="font-semibold text-teal-700" to="/login">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}

export default Register;
