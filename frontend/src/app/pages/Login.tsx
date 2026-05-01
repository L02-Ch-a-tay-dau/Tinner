import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Utensils, Mail, Lock } from "lucide-react";
import { authService } from "../utils/auth";
import { motion } from "motion/react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const user = authService.login(email, password);
    if (user) {
      navigate("/");
    } else {
      setError("Invalid email or password");
    }
  };

  const handleGuestLogin = () => {
    authService.loginAsGuest();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Log in to continue swiping</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-gray-700 text-sm mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl transition-colors shadow-lg shadow-orange-200"
          >
            Log In
          </motion.button>
        </form>
        <div className="mt-6 flex items-center justify-center">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="px-4 text-xs text-gray-400 uppercase tracking-wider">Or</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleGuestLogin}
          className="w-full mt-6 bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-2xl border border-gray-200 transition-colors shadow-sm"
        >
          Quick Login as Guest
        </motion.button>

        {/* Sign up link */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-orange-500 hover:text-orange-600 transition-colors">
            Sign Up
          </Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-blue-900 text-xs">
            <strong>Demo:</strong> Create an account or use any email/password combination you create
          </p>
        </div>
      </motion.div>
    </div>
  );
}
