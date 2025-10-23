import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";

function AdminRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/admin/register", form);
      alert(res.data.message);
      setForm({ name: "", email: "", password: "" });
      navigate("/admin-login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 animate-gradient-x">
      <form
        onSubmit={handleRegister}
        className="bg-white text-black p-10 rounded-3xl shadow-2xl w-full max-w-md transform hover:scale-105 transition-transform duration-300"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-green-600 drop-shadow-lg">
          Admin Register
        </h2>

        {error && (
          <p className="text-red-600 text-center mb-4 bg-red-100 p-2 rounded">
            {error}
          </p>
        )}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full mb-4 p-4 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full mb-4 p-4 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full mb-6 p-4 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-xl shadow-lg hover:from-green-600 hover:to-teal-600 transition-all mb-5"
        >
          Register
        </button>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/admin-login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default AdminRegister;
