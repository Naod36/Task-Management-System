import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface LoginProps {
  onLogin: (token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.access_token;
      onLogin(token); // update App state
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 p-4">
        <h1 className="text-2xl text-white font-semibold text-center">
          Task Management System
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral-800 p-8 mt-10 rounded-xl shadow-lg w-full max-w-md"
        >
          <p className="text-2xl  text-white font-bold mb-6 text-center">
            Login
          </p>
          {error && (
            <div className="text-red-400 mb-4 text-center p-2 bg-red-900/20 rounded-md">
              {error}
            </div>
          )}

          {/* Email Input */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />

          {/* Password Input */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-amber-500 text-white py-3 rounded-md font-semibold hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
          >
            Login
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="grow border-t border-neutral-600"></div>
            <span className="mx-4 text-neutral-400 text-sm">
              Or register through the link below
            </span>
            <div className="grow border-t border-neutral-600"></div>
          </div>

          {/* Register Text Link */}
          <p className="mt-8 text-center text-sm text-neutral-400">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="font-semibold text-amber-500 hover:text-amber-400 cursor-pointer hover:underline"
            >
              Register
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
