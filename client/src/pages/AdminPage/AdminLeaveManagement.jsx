// import React from "react";
// import { Check, X, Calendar, FileText } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import { useEffect, useState } from "react";
// import API from "../../utils/api";

// export default function AdminLeaveManagement() {
//   const [leaves, setLeaves] = useState([]);

//   useEffect(() => {
//     fetchLeaves();
//   }, []);

//   const fetchLeaves = async () => {
//     try {
//       const res = await API.get("/leave");
//       setLeaves(res.data);
//     } catch (err) {
//       toast.error("Error fetching leaves");
//     }
//   };

//   const handleApprove = async (id) => {
//     try {
//       await API.put(`/leave/${id}`, { status: "Approved" });
//       toast.success("Leave approved");
//       fetchLeaves();
//     } catch (err) {
//       toast.error("Error approving leave");
//     }
//   };

//   const handleReject = async (id) => {
//     try {
//       await API.put(`/leave/${id}`, { status: "Rejected" });
//       toast.success("Leave rejected");
//       fetchLeaves();
//     } catch (err) {
//       toast.error("Error rejecting leave");
//     }
//   };

//   const getStatusClasses = (status) => {
//     switch (status) {
//       case "Approved":
//         return "bg-green-500 text-white";
//       case "Rejected":
//         return "bg-red-500 text-white";
//       case "Pending":
//         return "bg-yellow-400 text-white";
//       default:
//         return "bg-gray-200 text-gray-700";
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen rounded-2xl shadow-2xl">
//       <Toaster />
//       <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
//         <FileText /> Leave Management
//       </h1>
//       <p className="text-gray-600 mb-6">Approve or reject employee leave requests</p>

//       <div className="space-y-4">
//         {leaves.length === 0 ? (
//           <p className="text-center text-gray-500">No leave requests</p>
//         ) : leaves.map((leave) => (
//           <div key={leave._id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
//             <div>
//               <p className="font-semibold">{leave.employeeName}</p>
//               <p>Date: {new Date(leave.date).toLocaleDateString()}</p>
//               <p>Reason: {leave.reason}</p>
//               <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(leave.status)}`}>
//                 {leave.status.toUpperCase()}
//               </span>
//             </div>
//             {leave.status === "Pending" && (
//               <div className="flex gap-2">
//                 <button onClick={() => handleApprove(leave._id)} className="bg-green-500 text-white px-3 py-1 rounded">
//                   <Check size={16} />
//                 </button>
//                 <button onClick={() => handleReject(leave._id)} className="bg-red-500 text-white px-3 py-1 rounded">
//                   <X size={16} />
//                 </button>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { Check, X, FileText } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import API from "../../utils/api";

export default function AdminLeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [summary, setSummary] = useState({ Approved: 0, Rejected: 0, Pending: 0 });

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
          <div key={leave._id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow dark:bg-gray-800">
            <div>
              <p className="font-semibold">{leave.employeeName}</p>
              <p>Date: {new Date(leave.date).toLocaleDateString()}</p>
              <p>Reason: {leave.reason}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(leave.status)}`}>
                {leave.status.toUpperCase()}
              </span>
            </div>
            {leave.status === "Pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(leave._id, "Approved")}
                  className="flex items-center px-3 py-1 text-white bg-green-500 rounded"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => handleUpdateStatus(leave._id, "Rejected")}
                  className="flex items-center px-3 py-1 text-white bg-red-500 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
