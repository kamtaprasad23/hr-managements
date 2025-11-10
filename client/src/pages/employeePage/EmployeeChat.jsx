import { useEffect, useState, useRef } from "react";
import API from "../../utils/api";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { socket } from "../../socket/socket.js"; // shared socket

export default function EmployeeChat() {
  const [users, setUsers] = useState([]);
  const [chatType, setChatType] = useState("admin");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [employeeId, setEmployeeId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const user = useSelector((state) => state.auth?.user);
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  // Load employee ID
  useEffect(() => {
    const storedEmployee = JSON.parse(localStorage.getItem("employee") || "null");
    const storedToken = localStorage.getItem("token");

    if (user?.id) {
      setEmployeeId(user.id);
      localStorage.setItem("employee", JSON.stringify(user));
    } else if (storedEmployee?.id) {
      setEmployeeId(storedEmployee.id);
    } else {
      console.warn("No employee found (Redux + LocalStorage empty)");
      if (!storedToken) toast.error("Session expired. Please log in again.");
    }
  }, [user]);

  // Fetch users list
  useEffect(() => {
    if (!employeeId) return;
    const endpoint =
      chatType === "admin"
        ? "/admin/chat-admins-for-employee"
        : "/admin/chat-users";

    API.get(endpoint)
      .then((res) => {
        const allUsers = res.data || [];
        const filteredUsers =
          chatType === "employee"
            ? allUsers.filter((u) => u.userType === "employee" && u._id !== employeeId)
            : allUsers;
        setUsers(filteredUsers);
      })
      .catch(() => {
        toast.error(`Failed to load ${chatType}s`);
      });
  }, [chatType, employeeId]);

  // Track online users
  useEffect(() => {
    socket.on("onlineUsers", (users) => setOnlineUsers(users));
    return () => socket.off("onlineUsers");
  }, []);

  // Join room & load messages
  useEffect(() => {
    if (!selectedUser || !employeeId) return;

    const roomId = [selectedUser._id, employeeId].sort().join("_");
    socket.emit("joinRoom", roomId);

    API.get(`/chat/${selectedUser._id}/${employeeId}`)
      .then((res) => {
        const sorted = (res.data || []).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sorted);
      })
      .catch(() => toast.error("Failed to load messages"));

    const onReceive = (msg) => {
      const valid =
        (msg.senderId === selectedUser._id && msg.receiverId === employeeId) ||
        (msg.senderId === employeeId && msg.receiverId === selectedUser._id);
      if (!valid) return;

      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receiveMessage", onReceive);

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off("receiveMessage", onReceive);
    };
  }, [selectedUser, employeeId]);

  // Auto scroll
  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [selectedUser]);

  // Send message
  const sendMessage = () => {
    if (!message.trim() || !selectedUser || !employeeId) return;

    const room = [selectedUser._id, employeeId].sort().join("_");
    const msgData = {
      room,
      senderId: employeeId,
      receiverId: selectedUser._id,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    socket.emit("sendMessage", msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessage("");
  };

  // File upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      toast.loading("Uploading file...", { id: "upload" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("senderId", employeeId);
      formData.append("receiverId", selectedUser._id);

      const token = localStorage.getItem("token");
      const res = await API.post("/chat", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      toast.dismiss("upload");
      if (res.status === 200 || res.status === 201) {
        socket.emit("sendMessage", res.data);
        setMessages((prev) => [...prev, res.data]);
        toast.success("File sent");
      } else toast.error("Upload failed");
    } catch {
      toast.dismiss("upload");
      toast.error("Upload failed");
    } finally {
      e.target.value = "";
    }
  };

  // Delete message/chat
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "chat") {
        await API.delete(`/chat/${selectedUser._id}/${employeeId}`);
        setMessages([]);
      } else if (deleteTarget.type === "message") {
        await API.delete(`/chat/message/${deleteTarget.id}`);
        setMessages((prev) => prev.filter((m) => m._id !== deleteTarget.id));
      }
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const confirmDeleteMessage = (msgId) => {
    setDeleteTarget({ type: "message", id: msgId });
    setShowDeleteModal(true);
  };
  const confirmDeleteChat = () => {
    setDeleteTarget({ type: "chat" });
    setShowDeleteModal(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-[85vh] border rounded-xl overflow-hidden shadow-md">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 border-r p-4 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
        <h2 className="text-lg font-semibold text-blue-600 mb-4 text-center">Chat With</h2>
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setChatType("admin")}
            className={`px-4 py-2 rounded ${chatType === "admin" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          >
            Admins
          </button>
          <button
            onClick={() => setChatType("employee")}
            className={`px-4 py-2 rounded ${chatType === "employee" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          >
            Employees
          </button>
        </div>

        {users.length > 0 ? (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`p-3 cursor-pointer rounded-lg flex items-center gap-2 ${
                  selectedUser?._id === u._id ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-700 hover:bg-gray-100"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${onlineUsers.includes(u._id) ? "bg-green-500" : "bg-red-500"}`}
                  title={onlineUsers.includes(u._id) ? "Online" : "Offline"}
                ></span>
                <span>{u.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm">No {chatType}s available</p>
        )}
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedUser ? "hidden md:flex" : "flex"}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <span className="font-semibold text-blue-600">Chat with {selectedUser.name}</span>
              <button onClick={confirmDeleteChat} className="text-red-600 text-sm flex items-center gap-1">
                <Trash2 size={16} /> Delete Chat
              </button>
            </div>

            {/* Messages */}
            <div ref={chatBoxRef} className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-100 dark:bg-gray-900">
              {messages.length ? (
                messages.map((m, i) => (
                  <div key={m._id || i} className={`px-3 py-2 rounded-xl max-w-[70%] ${m.senderId === employeeId ? "bg-blue-600 text-white ml-auto" : "bg-gray-200 text-black"}`}>
                    {m.message}
                    {m.senderId === employeeId && m._id && (
                      <button onClick={() => confirmDeleteMessage(m._id)} className="ml-2 text-red-500 hover:text-red-700">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center">No messages yet</p>
              )}
            </div>

            {/* Input */}
            <div className="p-3 flex gap-2 border-t">
              <input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 p-2 border rounded-lg"
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} className="bg-blue-600 text-white px-5 py-2 rounded-lg">Send</button>
              <input id="employeeFileInput" type="file" accept="image/*,.pdf,.docx,.xlsx" onChange={handleFileChange} className="hidden" />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">Select a {chatType} to start chatting</div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-5 rounded-lg shadow-xl text-center">
              <p className="mb-4 text-red-600 font-semibold">
                {deleteTarget?.type === "chat" ? "Delete entire chat?" : "Delete this message?"}
              </p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">{isDeleting ? "Deleting..." : "Delete"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
