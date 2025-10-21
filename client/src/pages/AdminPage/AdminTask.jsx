

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import { Plus, Clock, AlertTriangle, Eye } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function AdminTask() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium",
    notes: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/task/admin");
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tasks");
      toast.error(err.response?.data?.message || "Failed to fetch tasks");
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/admin/employees");
      setEmployees(Array.isArray(res.data.employees) ? res.data.employees : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch employees");
      toast.error(err.response?.data?.message || "Failed to fetch employees");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/task", form);
      toast.success("Task assigned successfully!");
      setForm({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
        priority: "Medium",
        notes: "",
      });
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign task");
      toast.error(err.response?.data?.message || "Failed to assign task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  p-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold ">📝 Task Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          {showForm ? "Cancel" : "Assign New Task"}
        </button>
      </div>

      {error && (
        <div className=" border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {showForm && (
        <div className=" shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Assign New Task</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium  mb-2">Task Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium  mb-2">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium  mb-2">Assign To *</label>
              <select
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} - {emp.position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium  mb-2">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium  mb-2">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the task..."
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="2"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600  py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Assigning..." : "Assign Task"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className=" py-3 px-6 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className=" shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">Assigned Tasks</h3>
          <p className="mt-1">Total: {tasks.length} tasks</p>
        </div>
        {tasks.length === 0 ? (
          <div className="p-8 text-center ">
            <Clock className="mx-auto h-12 w-12  mb-4" />
            <p>No tasks assigned yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium  uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className=" divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-500">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium">
                            {task.title}
                          </div>
                          <div className="text-sm truncate max-w-xs">
                            {task.description.length > 50
                              ? `${task.description.substring(0, 50)}...`
                              : task.description
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {task.assignedTo?.name || "N/A"}
                      <div className="text-xs ">
                        {task.assignedTo?.position || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {new Date(task.dueDate).toLocaleDateString()}
                      {task.isOverdue && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle size={12} className="mr-1" />
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => console.log("View task:", task._id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Helpers
const getPriorityColor = (priority) => {
  switch (priority) {
    case "Urgent": return "bg-red-500 text-white";
    case "High": return "bg-orange-500 text-white";
    case "Medium": return "bg-yellow-500 text-white";
    case "Low": return "bg-green-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "Completed": return "bg-green-100 text-green-800";
    case "In Progress": return "bg-yellow-100 text-yellow-800";
    case "Pending": return "bg-blue-100 text-blue-800";
    case "Rejected": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};
