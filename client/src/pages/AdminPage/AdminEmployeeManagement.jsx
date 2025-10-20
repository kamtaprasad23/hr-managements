import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../utils/api";
import toast, { Toaster } from "react-hot-toast";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function AdminEmpManagement() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    salary: "",
    password: "",
    address: "",
    department: "",
    jobType: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyNumber: "",
    birthday: "",
    image: "",
    highestQualification: "",
    yearOfPassing: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
    idType: "",
    idNumber: "",
    alternateNumber: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [dropdownId, setDropdownId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [employeeToDeleteId, setEmployeeToDeleteId] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (showConfirmationModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showConfirmationModal, countdown]);


  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      console.log("🔄 Fetching employees from /admin/employees...");
      const res = await API.get("/admin/employees");
      console.log("✅ Employees Response:", res.data);
      setEmployees(Array.isArray(res.data.employees) ? res.data.employees : []);
      setError("");
    } catch (err) {
      console.error("❌ Fetch Employees Error:", {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        url: err.response?.config?.url,
      });
      setError(`Error fetching employees: ${err.response?.data?.message || err.message}`);
      if (err.response?.status === 401) {
        setTimeout(() => navigate("/admin-login"), 2000);
      }
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("📤 Submitting to:", editingId ? `/admin/employee/${editingId}` : "/admin/employee", "Data:", form);
      const requestData = { ...form };
      if (editingId) {
        const res = await API.put(`/admin/employee/${editingId}`, requestData);
        console.log("✅ Employee updated:", res.data);
        toast.success("Employee updated successfully");
      } else {
        const res = await API.post("/admin/employee", requestData);
        console.log("✅ Employee added:", res.data);
        toast.success("Employee added successfully");
      }
      setForm({
        name: "",
        email: "",
        phone: "",
        position: "",
        salary: "",
        password: "",
        address: "",
        department: "",
        jobType: "",
        emergencyName: "",
        emergencyRelation: "",
        emergencyNumber: "",
        birthday: "",
        image: "",
        highestQualification: "",
        yearOfPassing: "",
        accountHolder: "",
        accountNumber: "",
        ifsc: "",
        bankName: "",
        idType: "",
        idNumber: "",
        alternateNumber: "",
      });
      setEditingId(null);
      fetchEmployees();
    } catch (err) {
      console.error("❌ Submit Error:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || "Error saving employee. Check console for details.");
    }
  };

  const handleEdit = (emp) => {
    setForm(emp);
    setEditingId(emp._id);
    setDropdownId(null);
  };

  const handleView = (emp) => {
    setSelectedEmployee(emp);
    setDropdownId(null);
  };

  const toggleDropdown = (id) => {
    setDropdownId(dropdownId === id ? null : id);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster />
      <h1 className="text-2xl font-bold mb-6">👨‍💼 Employee Management</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchEmployees}
            className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg shadow"
      >
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded-md"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded-md"
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          maxLength={10}
          minLength={10}
          className="border border-gray-300 p-2 rounded-md"
          required
        />
        <select
          name="position"
          value={form.position}
          onChange={handleChange}
          className="border text-gray-700 border-gray-300 p-2 rounded-md"
          required
        >
          <option value="">Select Position</option>
          <option value="Full Stack">Full Stack</option>
          <option value="MERN Stack">MERN Stack</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Digital Marketing">Digital Marketing</option>
          <option value="UI/UX">UI/UX</option>
          <option value="Graphic Design">Graphic Design</option>
          <option value="Floater">Floater</option>
        </select>

        <input
          type="tel"
          name="salary"
          placeholder="Salary"
          value={form.salary}
          onChange={handleChange}
          maxLength={6}
          className="border border-gray-300 p-2 rounded-md"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded-md"
          required={!editingId} // Password is only required when creating a new employee
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          {editingId ? "Update Employee" : "Add Employee"}
        </button>
     
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Name</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Email</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Phone</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Position</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Salary</th>
              <th className="p-3 text-center text-sm font-semibold text-gray-600 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 whitespace-nowrap">
                    <Link to={`/admin/dashboard/employee/${emp._id}`} className="text-blue-600 hover:underline font-medium">
                      {emp.name}
                    </Link>
                  </td>
                  <td className="p-3 whitespace-nowrap text-gray-700">{emp.email}</td>
                  <td className="p-3 whitespace-nowrap text-gray-700">{emp.phone}</td>
                  <td className="p-3 whitespace-nowrap text-gray-700">{emp.position}</td>
                  <td className="p-3 whitespace-nowrap text-gray-700">{emp.salary || "-"}</td>
                  <td className="p-3 text-center relative">
                    <button
                      onClick={() => toggleDropdown(emp._id)}
                      className="px-2 py-1 text-gray-600 rounded hover:bg-gray-300"
                    >
                      <BsThreeDotsVertical />
                    </button>
                    {dropdownId === emp._id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleView(emp)}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setEmployeeToDeleteId(emp._id);
                            setShowConfirmationModal(true);
                            setCountdown(5); // Reset countdown
                            setDropdownId(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Employee Details</h2>
            <p><strong>Name:</strong> {selectedEmployee.name}</p>
            <p><strong>Email:</strong> {selectedEmployee.email}</p>
            <p><strong>Phone:</strong> {selectedEmployee.phone}</p>
            <p><strong>Position:</strong> {selectedEmployee.position}</p>
            <p><strong>Salary:</strong> {selectedEmployee.salary || "-"}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this employee?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  setEmployeeToDeleteId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await API.delete(`/admin/employee/${employeeToDeleteId}`);
                  toast.success("Employee deleted successfully");
                  fetchEmployees();
                  setShowConfirmationModal(false);
                  setEmployeeToDeleteId(null);
                }}
                disabled={countdown > 0}
                className={`px-4 py-2 text-white rounded-md transition ${countdown > 0
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {countdown > 0 ? `Yes, Delete (${countdown})` : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}