import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Home,
  FileText,
  BookOpen,
  Banknote,
  Phone,
  RefreshCcw,
  Upload,
  Trash2,
  CheckCircle,
  Save,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../utils/api";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileImg, setProfileImg] = useState("https://via.placeholder.com/150");
  const fileInputRef = useRef(null);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile");
      setProfile(res.data);
      setForm(res.data || {});
      // Convert relative path to full URL
      if (res.data?.image) setProfileImg(`http://localhost:5000${res.data.image}`);
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
      toast.error("Failed to load employee profile");
    } finally {
      setLoading(false);
    }
  };
  fetchProfile();
}, []);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadClick = () => fileInputRef.current.click();
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file); // Match the backend field name

    try {
      // 1. Upload the image
      const uploadRes = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { filePath } = uploadRes.data;

      // 2. Update the user profile with the new image path
      const profileUpdateRes = await API.put("/profile", { ...form, image: filePath });

      toast.success("Profile image uploaded successfully!");
      setProfileImg(`http://localhost:5000${filePath}`); // Update UI immediately
      setForm(profileUpdateRes.data.employee || profileUpdateRes.data); // Keep form state in sync
    } catch (err) {
      console.error("❌ Image Upload Error:", err);
      toast.error("Error uploading profile image");
    }
  };

  const handleSave = async () => {
    try {
      const res = await API.put("/profile", form);
      setProfile(res.data.employee || res.data);
      setEditing(false);
      toast.success("Profile submitted successfully! Awaiting admin verification.");
    } catch (err) {
      console.error("❌ Update Error:", err);
      toast.error("Failed to submit profile");
    }
  };

  const handleRefresh = () => window.location.reload();

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Employee Profile</h2>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 bg-green-600 text-white px-3 sm:px-4 py-1.5 rounded-lg hover:bg-green-700"
              >
                <Save size={16} /> Submit
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setForm(profile || {}); // Reset form on cancel
                }}
                className="flex items-center gap-1 bg-gray-400 text-white px-4 py-1.5 rounded-lg hover:bg-gray-500"
              >
                <XCircle size={16} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center mb-6">
        <img
          src={profileImg}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover"
        />
       {editing ? (
  <div className="flex gap-2 mt-2">
    <button
      type="button"
      onClick={handleUploadClick}
      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      <Upload size={16} /> Upload
    </button>
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleFileChange}
    />
  </div>
) : (
  <div className="flex items-center gap-2 mt-3">
    {profile?.verified ? (
      <>
        <CheckCircle className="text-green-500" />
        <span className="text-green-600 font-semibold">
          ✅ Verified Successfully by HR
        </span>
      </>
    ) : (
      <>
        <CheckCircle className="text-yellow-500" />
        <span className="text-yellow-600 font-semibold">
          ⏳ Awaiting Verification
        </span>
      </>
    )}
  </div>
)}

      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <ProfileCard
          icon={<User className="text-blue-500" />}
          title="Basic Info"
          fields={[
            ["name", "Full Name", "text"], // Assuming 'name' is the field for full name
            ["email", "Email", "email"],
            ["birthday", "Date of Birth", "date"]
          ]}
          editing={editing}
          form={form}
          handleChange={handleChange}
        />

        <ProfileCard
          icon={<BookOpen className="text-green-500" />}
          title="Education"
          fields={[
            ["highestQualification", "Highest Qualification"],
            ["yearOfPassing", "Year of Passing"],
          ]}
          editing={editing}
          form={form}
          handleChange={handleChange}
        />

        <ProfileCard
          icon={<Home className="text-purple-500" />}
          title="Address"
          fields={[["address", "Address"]]}
          editing={editing}
          form={form}
          handleChange={handleChange}
        />

        <ProfileCard
          icon={<Banknote className="text-indigo-500" />}
          title="Bank Details"
          fields={[
            ["accountHolder", "Account Holder"],
            ["bankName", "Bank Name"],
            ["accountNumber", "Account Number"],
            ["ifsc", "IFSC Code"],
          ]}
          editing={editing}
          form={form}
          handleChange={handleChange}
        />

        <ProfileCard
          icon={<FileText className="text-red-500" />}
          title="Identification"
          fields={[
            ["idType", "ID Type"],
            ["idNumber", "ID Number"],
          ]}
          editing={editing}
          form={form}
          handleChange={handleChange}
        />

        <ProfileCard
          icon={<Phone className="text-yellow-500" />}
          title="Emergency Contact"
          fields={[
            ["emergencyName", "Emergency Name"],
            ["emergencyRelation", "Emergency Relation"],
            ["emergencyNumber", "Emergency Number"],
          ]}
          editing={editing}
          form={form}
          handleChange={handleChange}
        />
      </div>
    </div>
  );
}

function ProfileCard({ icon, title, fields, editing, form, handleChange }) {
  return (
    <div className="cursor-pointer hover:shadow-lg transition rounded-2xl shadow-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-semibold">{title}</span>
      </div>
      <div className="text-gray-700 space-y-2 text-sm">
        {fields.map(([key, label, type = "text"]) =>
          editing ? (
            <div key={key}>
              <label className="text-xs text-gray-500">{label}</label>
              <input
                type={type}
                name={key}
                // For date inputs, we need to format the value correctly (YYYY-MM-DD)
                value={type === 'date' && form[key] ? form[key].split('T')[0] : form[key] || ""}
                onChange={handleChange}
                className="w-full border rounded-md px-2 py-1 text-sm"
              />
            </div>
          ) : (
            <p key={key}>
              {/* Format date for display, otherwise show the value or a dash */}
              {type === 'date' && form[key] ? new Date(form[key]).toLocaleDateString() : form[key] || "—"}
            </p>
          )
        )}
      </div>
    </div>
  );
}