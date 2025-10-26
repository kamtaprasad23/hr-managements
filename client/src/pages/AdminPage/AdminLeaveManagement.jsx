
import React, { useEffect, useState } from "react";
import { Check, X, FileText, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import API from "../../utils/api";

export default function AdminLeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [summary, setSummary] = useState({ Approved: 0, Rejected: 0, Pending: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leaveToDeleteId, setLeaveToDeleteId] = useState(null);


  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/leave?month=" + (new Date().getMonth() + 1) + "&year=" + new Date().getFullYear());
      setLeaves(res.data);

      // Calculate summary
      const newSummary = { Approved: 0, Rejected: 0, Pending: 0 };
      res.data.forEach((leave) => {
        if (leave.status in newSummary) newSummary[leave.status]++;
      });
      setSummary(newSummary);

    } catch (err) {
      toast.error("Error fetching leaves");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.put(`/leave/${id}`, { status });
      toast.success(`Leave ${status.toLowerCase()} successfully`);
      fetchLeaves();
    } catch (err) {
      toast.error("Error updating leave status");
    }
  };

  const handleDeleteLeave = async () => {
    if (!leaveToDeleteId) return;
    try {
      await API.delete(`/leave/${leaveToDeleteId}`);
      toast.success("Leave request deleted successfully");
      setLeaveToDeleteId(null);
      setShowDeleteModal(false);
      fetchLeaves(); // Refresh the list
    } catch (err) {
      toast.error("Error deleting leave request");
    }
  };

  const openDeleteModal = (id) => {
    setLeaveToDeleteId(id);
    setShowDeleteModal(true);
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-500 text-white";
      case "Rejected":
        return "bg-red-500 text-white";
      case "Pending":
        return "bg-yellow-400 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="p-6">
      <Toaster />
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <FileText /> Leave Management
      </h1>
      <p className="mb-6">Approve or reject employee leave requests</p>

      {/* Leave Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="px-4 py-2 text-green-800 bg-green-100 rounded shadow dark:bg-gray-700 dark:text-green-300">
          Approved: {summary.Approved}
        </div>
        <div className="px-4 py-2 text-red-800 bg-red-100 rounded shadow dark:bg-gray-700 dark:text-red-300">
          Rejected: {summary.Rejected}
        </div>
        <div className="px-4 py-2 text-yellow-800 bg-yellow-100 rounded shadow dark:bg-gray-700 dark:text-yellow-300">
          Pending: {summary.Pending}
        </div>
      </div>

      {/* Leave List */}
      <div className="space-y-4">
        {leaves.length === 0 ? (
          <p className="text-center ">No leave requests for this month</p>
        ) : leaves.map((leave) => (
          <div key={leave._id} className="flex items-center justify-between p-4 rounded-xl shadow ">
            <div>
              <p className="font-semibold">{leave.employeeName}</p>
              <p>Date: {new Date(leave.date).toLocaleDateString()}</p>
              <p>Reason: {leave.reason}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(leave.status)}`}>
                {leave.status.toUpperCase()}
              </span>
            </div>
            <div className="flex gap-2">
              {leave.status === "Pending" && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(leave._id, "Approved")}
                    className="flex items-center px-3 py-1 text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(leave._id, "Rejected")}
                    className="flex items-center px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </>
              )}
              <button
                onClick={() => openDeleteModal(leave._id)}
                className="flex items-center px-3 py-1 text-white bg-gray-500 rounded hover:bg-gray-600"
                title="Delete Leave Request"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black  rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className=" mb-6">Are you sure you want to delete this leave request? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-400 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLeave}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
