import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import { useParams } from "react-router-dom";
import {
  User,
  Home,
  FileText,
  BookOpen,
  Banknote,
  Phone,
  Calendar,
  CheckCircle,
  Edit,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminEmployeeProfile() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

 useEffect(() => {
  const fetchEmployee = async () => {
    try {
      const res = await API.get(`/admin/employee/${id}`);
      
      // Prepend server URL if image exists
      const employeeData = {
        ...res.data,
        image: res.data.image ? `http://localhost:5000${res.data.image}` : "https://via.placeholder.com/150",
      };

      setEmployee(employeeData);
      setIsVerified(res.data.verified || false);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load employee profile");
      setLoading(false);
    }
  };
  if (id) fetchEmployee();
}, [id]);


  const handleVerification = async () => {
    try {
      const res = await API.put(`/admin/employee/${id}/verify`, { verified: true });
      if (res.data.success) {
        setIsVerified(true);
        toast.success("Employee verified successfully!");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Verification failed!");
    }
  };

  if (loading)
    return <div className="text-center mt-10">Loading employee profile...</div>;

  if (error)
    return (
      <div className="text-red-500 text-center mt-10">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );

  if (!employee)
    return (
      <div className="text-center mt-10">
        <p>No employee data available.</p>
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Buttons */}
      <div className="flex gap-3 mb-4">
        {!isVerified && (
          <button
            onClick={handleVerification}
            className="px-4 py-2 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
          >
            Verify
          </button>
        )}
        <button
          onClick={() => alert("Edit functionality to be implemented")}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit size={16} /> Edit Profile
        </button>
      </div>

      {/* Profile Image */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={employee.image || "https://via.placeholder.com/150"}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover"
        />
        <div className="flex items-center gap-2 mt-3">
          {isVerified ? (
            <>
              <CheckCircle className="text-green-500" />
              <span className="text-green-600 font-semibold">
                Verified by HR
              </span>
            </>
          ) : (
            <span className="text-gray-500 font-semibold">Not Verified</span>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card icon={<User className="text-blue-500" />} title="Basic Info">
          <p>{employee.name || "N/A"}</p>
          <p>{employee.email || "N/A"}</p>
          <p>{employee.phone || "N/A"}</p>
        </Card>

        <Card icon={<BookOpen className="text-green-500" />} title="Education">
          <p>{employee.highestQualification || "N/A"}</p>
          <p>{employee.yearOfPassing || "N/A"}</p>
        </Card>

        <Card icon={<Home className="text-purple-500" />} title="Address">
          <p>{employee.address || "N/A"}</p>
        </Card>

        <Card icon={<Banknote className="text-indigo-500" />} title="Bank Details">
          <p>{employee.accountHolder || "N/A"}</p>
          <p>{employee.bankName || "N/A"}</p>
          <p>{employee.accountNumber || "N/A"}</p>
        </Card>

        <Card icon={<FileText className="text-red-500" />} title="Identification">
          <p>{employee.idType || "N/A"}</p>
          <p>{employee.idNumber || "N/A"}</p>
        </Card>

        <Card icon={<Phone className="text-yellow-500" />} title="Emergency Contact">
          <p>{employee.emergencyName || "N/A"}</p>
          <p>{employee.emergencyRelation || "N/A"}</p>
          <p>{employee.emergencyNumber || "N/A"}</p>
        </Card>

        <Card icon={<Calendar className="text-pink-500" />} title="Birthday">
          <p>
            {employee.birthday
              ? new Date(employee.birthday).toLocaleDateString()
              : "N/A"}
          </p>
        </Card>
      </div>
    </div>
  );
}

function Card({ icon, title, children }) {
  return (
    <div className="rounded-2xl shadow-2xl p-4 hover:shadow-lg transition">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-semibold">{title}</span>
      </div>
      <div className="text-gray-700 space-y-1 text-sm">{children}</div>
    </div>
  );
}
