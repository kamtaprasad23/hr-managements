// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { loginSuccess } from "../features/auth/authSlice";
// import API from "../utils/api";

// function AdminLogin() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setError("");
//     setSuccess("");
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await API.post("/admin/login", form);
//       const { token, role } = res.data;

//       dispatch(
//         loginSuccess({
//           user: { email: form.email, role },
//           token,
//         })
//       );

//       localStorage.setItem("token", token);
//       localStorage.setItem("role", role);

//       setSuccess(res.data.message);
//       setError("");

//       setTimeout(() => navigate("/admin/dashboard"), 1000);
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed. Please try again.");
//       setSuccess("");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 animate-gradient-x">
//       <form
//         onSubmit={handleLogin}
//         className="bg-white text-black p-10 rounded-3xl shadow-2xl w-full max-w-md transform hover:scale-105 transition-transform duration-300"
//       >
//         <h2 className="text-3xl font-bold mb-8 text-center text-blue-600 drop-shadow-lg">
//           Admin Login
//         </h2>

//         {error && (
//           <p className="text-red-600 text-center mb-4 bg-red-100 p-2 rounded">
//             {error}
//           </p>
//         )}
//         {success && (
//           <p className="text-green-600 text-center mb-4 bg-green-100 p-2 rounded">
//             {success}
//           </p>
//         )}

//         <div className="mb-4">
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             value={form.email}
//             onChange={handleChange}
//             required
//             className="w-full p-4 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="mb-6">
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={form.password}
//             onChange={handleChange}
//             required
//             className="w-full p-4 border text-black border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="text-right mb-4">
//           <Link to="/admin/forgot-password" className="text-sm text-blue-600 hover:underline">
//             Forgot Password?
//           </Link>
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all mb-5"
//         >
//           Login
//         </button>

//         <p className="mt-4 text-center text-gray-600">
//           Don’t have an account?{" "}
//           <Link to="/admin-register" className="text-blue-600 hover:underline">
//             Register
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// }

// export default AdminLogin;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react"; // 👈 added
import { loginSuccess } from "../features/auth/authSlice";
import API from "../utils/api";
import Loader from "../components/Laoder"

function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 added
  const [loading, setLoading] = useState(false); // 👈 added loader
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // 👈 start loader
    try {
      const res = await API.post("/admin/login", form);
      const { token, role } = res.data;

      dispatch(
        loginSuccess({
          user: { email: form.email, role },
          token,
        })
      );

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      setSuccess(res.data.message);
      setError("");

      setTimeout(() => navigate("/admin/dashboard"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      setSuccess("");
    } finally {
      setLoading(false); // 👈 stop loader
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 animate-gradient-x">
      {loading && <Loader />}

      <form
        onSubmit={handleLogin}
        className="bg-white text-black p-10 rounded-3xl shadow-2xl w-full max-w-md transform hover:scale-105 transition-transform duration-300"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-600 drop-shadow-lg">
          Admin Login
        </h2>

        {error && (
          <p className="text-red-600 text-center mb-4 bg-red-100 p-2 rounded">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 text-center mb-4 bg-green-100 p-2 rounded">
            {success}
          </p>
        )}

        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full p-4 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 👇 password field with toggle */}
        <div className="mb-6 relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full p-4 border text-black border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="text-right mb-4">
          <Link to="/admin/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all mb-5 ${
            loading && "opacity-70 cursor-not-allowed"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link to="/admin-register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p> */}
      </form>
    </div>
  );
}

export default AdminLogin;
