// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { loginSuccess } from "../features/auth/authSlice";
// import API from "../utils/api";

// function EmployeeLogin() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setError("");
//     setSuccess("");
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     setLoading(true);

//     try {
//       const res = await API.post("/login", form);
//       const { token, employee } = res.data;

//       dispatch(
//         loginSuccess({
//           user: { name: employee.name, email: employee.email, role: "employee" },
//           token,
//         })
//       );

//       localStorage.setItem("token", token);
//       localStorage.setItem("role", "employee");
//       setSuccess("Login successful");

//       setTimeout(() => {
//         navigate("/employee");
//         setForm({ email: "", password: "" });
//       }, 1000);
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 animate-gradient-x">
//       <form
//         onSubmit={handleLogin}
//         className="text-black bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md transform hover:scale-105 transition-transform duration-300"
//       >
//         <h2 className="text-3xl font-bold mb-8 text-center text-blue-600 drop-shadow-lg">
//           Employee Login
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
//             disabled={loading}
//             className="w-full p-4 border text-black border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
//             disabled={loading}
//             className="w-full p-4 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className={`w-full py-3 rounded-xl text-white shadow-lg transition-all duration-200 ${
//             loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
//           }`}
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>

//         <p className="mt-4 text-center text-black">
//           Back to{" "}
//           <Link to="/" className="text-yellow-500 hover:underline">
//             Login Selection
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// }

// export default EmployeeLogin;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react"; // 👈 added
import { loginSuccess } from "../features/auth/authSlice";
import API from "../utils/api";
import Loader from "../components/Laoder"


function EmployeeLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 added
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await API.post("/login", form);
      const { token, employee } = res.data;

      dispatch(
        loginSuccess({
          user: { name: employee.name, email: employee.email, role: "employee" },
          token,
        })
      );

      localStorage.setItem("token", token);
      localStorage.setItem("role", "employee");
      setSuccess("Login successful");

      setTimeout(() => {
        navigate("/employee");
        setForm({ email: "", password: "" });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 animate-gradient-x">
      {loading && <Loader />}

      <form
        onSubmit={handleLogin}
        className="text-black bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md transform hover:scale-105 transition-transform duration-300"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-600 drop-shadow-lg">
          Employee Login
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
            className="w-full p-4 border text-black border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full p-4 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white shadow-lg transition-all duration-200 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-black">
          Back to{" "}
          <Link to="/" className="text-yellow-500 hover:underline">
            Login Selection
          </Link>
        </p>
      </form>
    </div>
  );
}

export default EmployeeLogin;
