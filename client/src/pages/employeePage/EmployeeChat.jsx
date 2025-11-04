import { useEffect, useState } from "react";
import io from "socket.io-client";
import API from "../../utils/api";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

const socket = io("http://localhost:5002", { transports: ["websocket"] });

export default function EmployeeChat() {
  const [users, setUsers] = useState([]);
  const [chatType, setChatType] = useState("admin");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [employeeId, setEmployeeId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = useSelector((state) => state.auth?.user);

  // ✅ Load employee ID
  useEffect(() => {
    const storedRaw = localStorage.getItem("employee");
    const stored = storedRaw ? JSON.parse(storedRaw) : null;

    if (user?.id) {
      setEmployeeId(user.id);
      localStorage.setItem("employee", JSON.stringify(user));
    } else if (stored?.id) {
      setEmployeeId(stored.id);
    } else {
      console.warn("⚠️ No employee found (Redux + LocalStorage both empty)");
    }
  }, [user]);

  // ✅ Fetch user list (admins or employees)
  useEffect(() => {
    const endpoint = chatType === "admin" ? "/admins" : "/getallEmployees";
    setUsers([]);
    setSelectedUser(null);

    API.get(endpoint)
      .then((res) => setUsers(res.data))
      .catch(() => toast.error(`Failed to load ${chatType}s`));
  }, [chatType]);

  // ✅ Join room & load messages
  useEffect(() => {
    if (!selectedUser || !employeeId) return;

    const roomId = [selectedUser._id, employeeId].sort().join("_");
    socket.emit("joinRoom", roomId);

    API.get(`/chat/${selectedUser._id}/${employeeId}`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sorted);
      })
      .catch(() => toast.error("Failed to load messages"));

    socket.on("receiveMessage", (msg) => {
      if (msg.senderId === employeeId) return;

      const validMsg =
        (msg.senderId === selectedUser._id && msg.receiverId === employeeId) ||
        (msg.senderId === employeeId && msg.receiverId === selectedUser._id);

      if (validMsg)
        setMessages((prev) =>
          [...prev, msg].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          )
        );
    });

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off("receiveMessage");
    };
  }, [selectedUser, employeeId]);

  // ✅ Scroll to bottom
  useEffect(() => {
    const chatBox = document.querySelector(".chat-box");
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  }, [messages]);

  // ✅ Send message
  const sendMessage = () => {
    if (!message.trim() || !selectedUser || !employeeId) return;

    const room = [selectedUser._id, employeeId].sort().join("_");
    const msgData = {
      room,
      senderId: employeeId,
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
  };

  // ✅ Confirm delete
  const confirmDeleteMessage = (msgId) => {
    setDeleteTarget({ type: "message", id: msgId });
    setShowDeleteModal(true);
  };

  const confirmDeleteChat = () => {
    setDeleteTarget({ type: "chat" });
    setShowDeleteModal(true);
  };

  // ✅ Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === "message") {
        await API.delete(`/chat/message/${deleteTarget.id}`);
        setMessages((prev) => prev.filter((m) => m._id !== deleteTarget.id));
        toast.success("Message deleted");
      } else if (deleteTarget.type === "chat" && selectedUser && employeeId) {
        await API.delete(`/chat/${selectedUser._id}/${employeeId}`);
        setMessages([]);
        toast.success("Chat deleted");
      }
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Format time
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // ✅ Helper: format date label like WhatsApp
  const getDateLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  return (
    <div
      className={`flex h-[85vh] border rounded-xl overflow-hidden shadow-md transition-colors duration-300 
      ${selectedUser ? "flex-col md:flex-row" : "flex-col"}`}
    >
      {/* SIDEBAR */}
      <div
        className={`w-full md:w-1/3 lg:w-1/4 border-r dark:border-gray-700 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800 
        ${selectedUser ? "hidden md:block" : "block"}`}
      >
        <h2 className="font-semibold text-lg mb-4 text-blue-600 text-center md:text-left">
          Chat With
        </h2>

        {/* Toggle buttons */}
       <div className="flex justify-center md:justify-start mb-5 gap-2 flex-wrap overflow-x-hidden">
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
</div>

        {/* User list */}
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
        className={`flex-1 flex flex-col relative bg-gray-100 dark:bg-gray-900 overflow-y-auto 
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
            <div className="flex-1 p-4 overflow-y-auto chat-box space-y-4 ">
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
                          m.senderId === employeeId
                            ? "bg-blue-600 text-white ml-auto self-end rounded-br-sm"
                            : "bg-gray-200 text-black dark:bg-blue-900 dark:text-white self-start rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words leading-snug pr-8">
                          {m.message}
                        </p>
                        <span className="absolute bottom-1 right-2 text-[10px] opacity-75">
                          {formatTime(m.createdAt)}
                        </span>
                        {m.senderId === employeeId && m._id && (
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
            <div className="p-3 flex gap-2 border-t dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 text-white border border-gray-300 dark:border-gray-700 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
