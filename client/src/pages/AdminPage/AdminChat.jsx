import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import API from "../../utils/api";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

const socket = io("http://localhost:5002", { transports: ["websocket"] });

export default function AdminChat() {
  const [users, setUsers] = useState([]);
  const [chatType, setChatType] = useState("employee");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [adminId, setAdminId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = useSelector((state) => state.auth?.user);

  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  // ✅ Load admin ID
  useEffect(() => {
    const storedRaw = localStorage.getItem("admin");
    const stored = storedRaw ? JSON.parse(storedRaw) : null;

    if (user?.id) {
      setAdminId(user.id);
      localStorage.setItem("admin", JSON.stringify(user));
    } else if (stored?.id) {
      setAdminId(stored.id);
    } else {
      console.warn("⚠️ No admin found (Redux + LocalStorage both empty)");
    }
  }, [user]);

  // ✅ Fetch users
  useEffect(() => {
    const endpoint =
      chatType === "employee" ? "/admin/employees" : "/admin/getAdmins";

    if (!endpoint) return;

    API.get(endpoint)
      .then((res) => {
        let data = res.data;
        if (adminId) {
          data = res.data.filter((u) => u._id !== adminId);
        }
        setUsers(data);
      })
      .catch(() => toast.error(`Failed to load ${chatType}s`));
  }, [chatType, adminId]);

  // ✅ Join room & listen for messages
  useEffect(() => {
    if (!selectedUser || !adminId) return;

    const roomId = [selectedUser._id, adminId].sort().join("_");
    socket.emit("joinRoom", roomId);

    API.get(`/chat/${selectedUser._id}/${adminId}`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sorted);
      })
      .catch(() => toast.error("Failed to load messages"));

   socket.on("receiveMessage", (msg) => {
  const validMsg =
    (msg.senderId === selectedUser._id && msg.receiverId === adminId) ||
    (msg.senderId === adminId && msg.receiverId === selectedUser._id);

  if (!validMsg) return;

  setMessages((prev) => {
    // Avoid duplicates
    const exists = prev.some(
      (m) =>
        m._id === msg._id ||
        (m.message === msg.message &&
          m.senderId === msg.senderId &&
          Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 1000)
    );
    if (exists) return prev;

    return [...prev, msg].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  });
});

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off("receiveMessage");
    };
  }, [selectedUser, adminId]);

  // ✅ Auto-scroll to bottom safely (handles mobile + resize)
  useEffect(() => {
    const el = chatBoxRef.current;
    if (!el) return;

    const scrollToBottom = () => {
      el.scrollTop = el.scrollHeight;
    };

    // Scroll on new messages or user change
    scrollToBottom();

    // Handle window resize (mobile keyboard open/close)
    const resizeHandler = () => setTimeout(scrollToBottom, 150);
    window.addEventListener("resize", resizeHandler);

    return () => window.removeEventListener("resize", resizeHandler);
  }, [messages, selectedUser]);

  // ✅ Send message
  const sendMessage = () => {
    if (!message.trim() || !selectedUser || !adminId) return;

    const room = [selectedUser._id, adminId].sort().join("_");
    const msgData = {
      room,
      senderId: adminId,
      receiverId: selectedUser._id,
      message,
      createdAt: new Date().toISOString(),
    };

    socket.emit("sendMessage", msgData);
    setMessages((prev) =>
      [...prev, msgData].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )
    );
    setMessage("");

    setTimeout(() => {
      const el = chatBoxRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  };

  // ✅ Delete logic
  const confirmDeleteMessage = (msgId) => {
    setDeleteTarget({ type: "message", id: msgId });
    setShowDeleteModal(true);
  };
  const confirmDeleteChat = () => {
    setDeleteTarget({ type: "chat" });
    setShowDeleteModal(true);
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === "message") {
        await API.delete(`/chat/message/${deleteTarget.id}`);
        setMessages((prev) => prev.filter((m) => m._id !== deleteTarget.id));
        toast.success("Message deleted");
      } else if (deleteTarget.type === "chat" && selectedUser && adminId) {
        await API.delete(`/chat/${selectedUser._id}/${adminId}`);
        setMessages([]);
        toast.success("Chat deleted");
      }
      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Format date header
  const getDateLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const key = new Date(msg.createdAt).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
    return groups;
  }, {});

  return (
    <div className="flex flex-col md:flex-row h-[85vh] border rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-900 transition-colors duration-300 max-w-full">
      {/* SIDEBAR */}
      <div
        className={`w-full md:w-1/3 lg:w-1/4 border-r dark:border-gray-700 p-4 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-800 
        ${selectedUser ? "hidden md:block" : "block"}`}
      >
        <h2 className="font-semibold text-lg mb-4 text-blue-600 text-center md:text-left">
          Chat With
        </h2>

        {/* Toggle */}
        <div className="flex justify-center md:justify-start mb-5 gap-2 flex-wrap overflow-x-hidden">
          <button
            onClick={() => setChatType("employee")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              chatType === "employee"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => setChatType("admin")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              chatType === "admin"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Admins
          </button>
        </div>

        {/* User List */}
        {users.length > 0 ? (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`p-3 cursor-pointer rounded-lg text-center md:text-left text-sm font-medium transition ${
                  selectedUser?._id === u._id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                }`}
              >
                {u.name}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center">
            No {chatType}s available
          </p>
        )}
      </div>

      {/* CHAT AREA */}
      <div
        className={`flex-1 flex flex-col relative bg-gray-100 dark:bg-gray-900 w-full overflow-hidden
        ${!selectedUser ? "hidden md:flex" : "flex"}`}
      >
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-700 font-semibold text-blue-600 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
              <span className="truncate">Chat with {selectedUser.name}</span>
              <button
                onClick={confirmDeleteChat}
                className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
              >
                <Trash2 size={18} /> Delete Chat
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatBoxRef}
              className="flex-1 p-4 overflow-y-auto chat-box space-y-4"
            >
              {Object.keys(groupedMessages).map((dateKey) => (
                <div key={dateKey}>
                  <div className="text-center text-gray-500 text-xs my-3">
                    {getDateLabel(dateKey)}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {groupedMessages[dateKey].map((m, i) => (
                      <div
                        key={m._id || i}
                        className={`relative group px-3 py-2 rounded-2xl max-w-[80%] md:max-w-[70%] break-words shadow-sm transition ${
                          m.senderId === adminId
                            ? "bg-blue-600 text-white ml-auto self-end rounded-br-sm"
                            : "bg-gray-200 text-black dark:bg-blue-900 dark:text-white self-start rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words leading-snug pr-8">
                          {m.message}
                        </p>
                        <span className="absolute bottom-1 right-2 text-[10px] opacity-75">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {m.senderId === adminId && m._id && (
                          <button
                            onClick={() => confirmDeleteMessage(m._id)}
                            className="absolute top-1 right-1 hidden group-hover:block text-xs text-red-300 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 flex gap-2 border-t dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0 z-20">
              <input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="flex-1 border border-gray-300 dark:border-gray-700 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-center p-5 text-sm">
            Select a {chatType} to start chatting
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-sm text-center">
              <h3 className="text-lg font-semibold mb-3 text-red-600">
                {deleteTarget?.type === "message"
                  ? "Delete this message?"
                  : "Delete entire chat?"}
              </h3>
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                >
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
