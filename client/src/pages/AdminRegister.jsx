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
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Admin Register</h2>

        {error && <p className="text-red-600 text-center mb-3">{error}</p>}

        <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required className="w-full mb-4 p-2 border rounded" />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full mb-4 p-2 border rounded" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full mb-4 p-2 border rounded" />

        <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
          Register
        </button>

        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link to="/admin-login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
}
export default AdminRegister;