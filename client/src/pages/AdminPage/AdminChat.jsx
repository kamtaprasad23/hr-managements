// frontend/src/components/chat/AdminChat.jsx
import { useEffect, useState, useRef } from "react";
import API from "../../utils/api";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Trash2, FileText } from "lucide-react";
import { socket } from "../../socket/socket.js"; // named import

export default function AdminChat() {
  const [users, setUsers] = useState([]);
  const [chatType, setChatType] = useState("employee");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const admin = useSelector((state) => state.auth?.user);
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  // Load users list
  useEffect(() => {
    if (!admin?.id) return;
    const endpoint = chatType === "employee" ? "/admin/employees" : "/admin/getAdmins";
    API.get(endpoint)
      .then((res) => {
        const data = (res.data || []).filter((u) => u._id !== admin.id);
        setUsers(data);
      })
      .catch((err) => {
        console.error("Load users error:", err.response?.data || err.message);
        toast.error(`Failed to load ${chatType}s`);
      });
  }, [chatType, admin]);

  // Online users
  useEffect(() => {
    socket.on("onlineUsers", (users) => setOnlineUsers(users));
    return () => socket.off("onlineUsers");
  }, []);

  // Auto-focus input
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [selectedUser]);

  // Join room & load messages
  useEffect(() => {
    if (!selectedUser || !admin?.id) return;
    const roomId = [selectedUser._id, admin.id].sort().join("_");
    socket.emit("joinRoom", roomId);

    API.get(`/chat/${selectedUser._id}/${admin.id}`)
      .then((res) => {
        const sorted = (res.data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(sorted);
      })
      .catch((err) => {
        console.error("Load messages error:", err.response?.data || err.message);
        toast.error("Failed to load messages");
      });

    // Listen for messages
    const handleReceive = (msg) => {
      const valid =
        (msg.senderId === selectedUser._id && msg.receiverId === admin.id) ||
        (msg.senderId === admin.id && msg.receiverId === selectedUser._id);
      if (!valid) return;

      // Avoid duplicates
      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m._id === msg._id ||
            (m.message === msg.message &&
              m.senderId === msg.senderId &&
              Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 1000)
        );
        if (exists) return prev;
        return [...prev, msg].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
    };

    const handleDelivered = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isDelivered: true } : m))
      );
    };

    const handleRead = ({ messageIds }) => {
      setMessages((prev) =>
        prev.map((m) => (messageIds.includes(m._id) ? { ...m, isRead: true } : m))
      );
    };

    socket.on("receiveMessage", handleReceive);
    socket.on("messageDelivered", handleDelivered);
    socket.on("messageRead", handleRead);

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off("receiveMessage", handleReceive);
      socket.off("messageDelivered", handleDelivered);
      socket.off("messageRead", handleRead);
    };
  }, [selectedUser, admin]);

  // Auto-scroll
  useEffect(() => {
    chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (!selectedUser || !admin?.id || messages.length === 0) return;
    const unreadIds = messages.filter((m) => m.receiverId === admin.id && !m.isRead).map((m) => m._id);
    if (unreadIds.length > 0) {
      const room = [selectedUser._id, admin.id].sort().join("_");
      socket.emit("confirmRead", { messageIds: unreadIds, room });
    }
  }, [messages, selectedUser, admin]);

  // Send message
  const sendMessage = () => {
    if (!message.trim() || !selectedUser || !admin?.id) return;
    const room = [selectedUser._id, admin.id].sort().join("_");
    const msgData = {
      room,
      senderId: admin.id,
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
      toast.loading("Uploading...", { id: "upload" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("senderId", admin.id);
      formData.append("receiverId", selectedUser._id);
      const token = localStorage.getItem("token");
      const res = await API.post("/chat", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      toast.dismiss("upload");
      if (res.status === 201) {
        socket.emit("sendMessage", res.data);
        setMessages((prev) => [...prev, res.data]);
        toast.success("File sent");
      } else toast.error("Upload failed");
    } catch (err) {
      console.error(err);
      toast.dismiss("upload");
      toast.error("Upload failed");
    } finally {
      e.target.value = "";
    }
  };

  // Delete message or chat
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "chat") {
        await API.delete(`/chat/${selectedUser._id}/${admin.id}`);
        setMessages([]);
      } else if (deleteTarget.type === "message") {
        await API.delete(`/chat/message/${deleteTarget.id}`);
        setMessages((prev) => prev.filter((m) => m._id !== deleteTarget.id));
      }
      toast.success("Deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      toast.error("Delete failed");
    } finally {
      setShowDeleteModal(false);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[85vh] border rounded-xl overflow-hidden shadow-md">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 border-r p-4 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
        <h2 className="text-lg font-semibold text-blue-600 mb-4 text-center">Chat With</h2>
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setChatType("employee")}
            className={`px-4 py-2 rounded ${chatType === "employee" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          >
            Employees
          </button>
          <button
            onClick={() => setChatType("admin")}
            className={`px-4 py-2 rounded ${chatType === "admin" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          >
            Admins
          </button>
        </div>
        {users.length > 0 ? (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`p-3 cursor-pointer rounded-lg ${selectedUser?._id === u._id ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-700 hover:bg-gray-100"}`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${onlineUsers.includes(u._id) ? "bg-green-500" : "bg-red-500"}`} title={onlineUsers.includes(u._id) ? "Online" : "Offline"}></span>
                <span>{u.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center">No {chatType}s available</p>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b flex justify-between items-center">
              <span className="font-semibold text-blue-600">Chat with {selectedUser.name}</span>
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setDeleteTarget({ type: "chat" });
                }}
                className="text-red-600 text-sm flex items-center gap-1"
              >
                <Trash2 size={16} /> Delete Chat
              </button>
            </div>

            {/* Messages */}
            <div ref={chatBoxRef} className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-100 dark:bg-gray-900">
              {messages.length ? (
                messages.map((m, i) => (
                  <div key={m._id || i} className={`px-3 py-2 rounded-xl max-w-[70%] ${m.senderId === admin.id ? "bg-blue-600 text-white ml-auto" : "bg-gray-200 text-black"}`}>
                    {m.message}
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
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center flex-1 text-gray-500">
            Select a {chatType} to start chatting
          </div>
        )}

        {/* Delete modal */}
        {showDeleteModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-5 rounded-lg shadow-xl text-center">
              <p className="mb-4 text-red-600 font-semibold">
                {deleteTarget?.type === "chat" ? "Delete entire chat?" : "Delete this message?"}
              </p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
