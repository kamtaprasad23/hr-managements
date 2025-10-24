import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import { Plus, Clock, AlertTriangle, Eye, X, Trash2 } from "lucide-react";
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
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);
  const [countdown, setCountdown] = useState(5);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (showDeleteModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showDeleteModal, countdown]);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await API.get("/task/admin");
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch tasks error:", err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || "Failed to fetch tasks");
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await API.get("/admin/employees");
      setEmployees(Array.isArray(res.data.employees) ? res.data.employees : []);
    } catch (err) {
      console.error("Fetch employees error:", err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || "Failed to fetch employees");
    }
  };

  // Form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Assign task
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/task", form);
      console.log("Task created:", res.data.task);
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
      console.error("Assign task error:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Failed to assign task");
      toast.error(err.response?.data?.message || "Failed to assign task");
    } finally {
      setLoading(false);
    }
  };

  // Open task modal
  const openTaskModal = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setShowModal(false);
  };

  // Open delete modal
  const openDeleteModal = (taskId) => {
    setTaskToDeleteId(taskId);  // save the task ID to delete
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setTaskToDeleteId(null);
    setShowDeleteModal(false);
  };


  // Delete task
  const handleDeleteTask = async () => {
    if (!taskToDeleteId) return;
    try {
      const res = await API.delete(`/task/${taskToDeleteId}`);
      console.log("Task deleted:", res.data.message);
      toast.success("Task deleted successfully!");

      // Remove deleted task from state immediately
      setTasks((prev) => prev.filter(task => task._id !== taskToDeleteId));

      closeDeleteModal();
    } catch (err) {
      console.error("Delete task error:", err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || "Failed to delete task");
    }
  };


  return (
    <div className="min-h-screen p-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📝 Task Management</h1>
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
        <div className="shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Assign New Task</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Task Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                maxLength="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
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
              <label className="block text-sm font-medium mb-2">Assign To *</label>
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
              <label className="block text-sm font-medium mb-2">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the task..."
                required
                maxLength="500"
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
                maxLength="300"
              />
            </div>
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Assigning..." : "Assign Task"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="py-3 px-6 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task Table */}
      <div className="shadow-lg rounded-lg overflow-hidden">
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
            <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="hidden sm:table-header-group">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider sm:px-6">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider sm:px-6">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider sm:px-6">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider sm:px-6">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider sm:px-6">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map((task) => (
                  <tr key={task._id} className="block sm:table-row border-b sm:border-none mb-4 sm:mb-0 hover:bg-gray-300 text-black dark:hover:bg-gray-800">
                    <td className="p-4 sm:px-6 sm:py-4 align-top block sm:table-cell">
                      <span className="font-bold sm:hidden">Task: </span>
                      <div className="text-sm font-medium break-words">{task.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 break-words mt-1">
                        {task.description}
                      </div>
                    </td>
                    <td className="p-4 sm:px-6 sm:py-4 whitespace-nowrap text-sm block sm:table-cell">
                      <span className="font-bold sm:hidden">Employee: </span>
                      {task.assignedTo?.name || "N/A"}
                      <div className="text-xs">{task.assignedTo?.position || "-"}</div>
                    </td>
                    <td className="p-4 sm:px-6 sm:py-4 align-top block sm:table-cell">
                      <span className="font-bold sm:hidden">Priority: </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4 sm:px-6 smpy-4 align-top text-sm block sm:table-cell">
                      <span className="font-bold sm:hidden">Due Date: </span>
                      {new Date(task.dueDate).toLocaleDateString()}
                      {task.isOverdue && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle size={12} className="mr-1" />
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="p-4 sm:px-6 sm:py-4 align-top block sm:table-cell">
                      <span className="font-bold sm:hidden">Status: </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium block sm:table-cell text-left sm:text-right">
                      <span className="font-bold sm:hidden">Actions: </span>
                      <button onClick={() => openTaskModal(task)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1">
                        <Eye size={16} />
                      </button>
                      {/* <button
                        onClick={() => openDeleteModal(task._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                      >
                        <Trash2 size={16} />
                      </button> */}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-lg w-11/12 max-w-md p-6 relative">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-2">{selectedTask.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{selectedTask.description}</p>
            <p className="text-sm"><span className="font-semibold">Assigned To:</span> {selectedTask.assignedTo?.name}</p>
            <p className="text-sm"><span className="font-semibold">Due Date:</span> {new Date(selectedTask.dueDate).toLocaleDateString()}</p>
            <p className="text-sm mb-2"><span className="font-semibold">Priority:</span> {selectedTask.priority}</p>
            <p className="text-sm mb-2"><span className="font-semibold">Status:</span> {selectedTask.status}</p>

            {selectedTask.status === "Rejected" && selectedTask.rejectionReason && (
              <p className="text-sm text-red-700 bg-red-50 p-2 rounded mb-2">
                <span className="font-semibold">Rejection Reason:</span> {selectedTask.rejectionReason}
              </p>
            )}
            {selectedTask.status === "Completed" && selectedTask.notes && (
              <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                <span className="font-semibold">Completion Notes:</span> {selectedTask.notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white text-black rounded-lg shadow-lg w-11/12 max-w-sm p-6 relative">
            <button onClick={closeDeleteModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-900">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button onClick={closeDeleteModal} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100">Cancel</button>
              <button
                onClick={handleDeleteTask}
                disabled={countdown > 0}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${countdown > 0 ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {countdown > 0 ? `Delete (${countdown})` : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
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
