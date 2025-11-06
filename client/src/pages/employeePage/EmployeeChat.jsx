import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import API from "../../utils/api";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { socket } from "../../socket/socket.js";


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
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  // Load employee ID from user or localStorage
  useEffect(() => {
    const storedRaw = localStorage.getItem("employee");
    const stored = storedRaw ? JSON.parse(storedRaw) : null;

    if (user?._id) {
      setEmployeeId(user._id);
      localStorage.setItem("employee", JSON.stringify(user));
    } else if (stored?._id) {
      setEmployeeId(stored._id);
    }
  }, [user]);

  // Load users list
  useEffect(() => {
    const endpoint = chatType === "admin" ? "/admins" : "/employees";
    setUsers([]);
    setSelectedUser(null);

    API.get(endpoint)
      .then((res) => setUsers(res.data))
      .catch(() => toast.error(`Failed to load ${chatType}s`));
  }, [chatType]);

  // Join chat room and receive messages
  useEffect(() => {
    if (!selectedUser || !employeeId) return;

    const roomId = [selectedUser._id, employeeId].sort().join("_");
        console.log("Joining room:", roomId);

    socket.emit("joinRoom", roomId);
    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.on("connect_error", (err) => console.error("❌ Socket connect error:", err.message));
socket.on("disconnect", (reason) => console.warn("🔴 Socket disconnected:", reason));


    API.get(`/chat/${selectedUser._id}/${employeeId}`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sorted);
      })
      .catch(() => toast.error("Failed to load messages"));

    socket.on("receiveMessage", (msg) => {
      const validMsg =
        (msg.senderId === selectedUser._id && msg.receiverId === employeeId) ||
        (msg.senderId === employeeId && msg.receiverId === selectedUser._id);

      if (!validMsg) return;

      setMessages((prev) => {
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
  }, [selectedUser, employeeId]);

  // Scroll chat to bottom
  useEffect(() => {
    const el = chatBoxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Send text message
  const sendMessage = () => {
    if (!message.trim() || !selectedUser || !employeeId) return;

    const room = [selectedUser._id, employeeId].sort().join("_");
    const msgData = {
      room,
      senderId: employeeId,
      receiverId: selectedUser._id,
      message,
      type: "text",
      createdAt: new Date().toISOString(),
    };

    socket.emit("sendMessage", msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessage("");
  };

  // Send file
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.loading("Uploading file...", { id: "upload" });

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");

      const res = await API.post("/chat/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.dismiss("upload");

      if (res.data.success) {
        const fileUrl = res.data.file.url;
        const fileType = fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          ? "image"
          : "file";

        const msgData = {
          senderId: employeeId,
          receiverId: selectedUser._id,
          type: fileType,
          message: fileUrl,
          createdAt: new Date().toISOString(),
        };

        socket.emit("sendMessage", msgData);
        setMessages((prev) => [...prev, msgData]);
        toast.success("File sent");
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload file");
    } finally {
      e.target.value = "";
    }
  };

  // Delete message or chat
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
      } else if (deleteTarget.type === "chat" && selectedUser && employeeId) {
        await API.delete(`/chat/${selectedUser._id}/${employeeId}`);
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

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const key = new Date(msg.createdAt).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
    return groups;
  }, {});

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

  const formatTime = (isoString) =>
    new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col md:flex-row h-[85vh] border rounded-xl overflow-hidden shadow-md transition-colors duration-300 max-w-full">
      <div
        className={`w-full md:w-1/3 lg:w-1/4 border-r dark:border-gray-700 p-4 overflow-y-auto ${
          selectedUser ? "hidden md:block" : "block"
        }`}
      >
        <h2 className="font-semibold text-lg mb-4 text-blue-600 text-center md:text-left">
          Chat With
        </h2>

        <div className="flex justify-center md:justify-start mb-5 gap-2 flex-wrap">
          <button
            onClick={() => setChatType("admin")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              chatType === "admin"
                ? "bg-blue-600 text-white"
                : "border hover:bg-gray-200 hover:text-black cursor-pointer"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setChatType("employee")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              chatType === "employee"
                ? "bg-blue-600 text-white"
                : "border hover:bg-gray-200 hover:text-black cursor-pointer"
            }`}
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
                className={`p-3 cursor-pointer rounded-lg text-center md:text-left text-sm font-medium transition ${
                  selectedUser?._id === u._id
                    ? "bg-blue-600 text-white"
                    : "border hover:bg-gray-200 hover:text-black"
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

      <div
        className={`flex-1 flex flex-col relative w-full overflow-hidden ${
          !selectedUser ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedUser ? (
          <>
            <div className="p-4 border-b dark:border-gray-700 font-semibold text-blue-600 flex justify-between items-center sticky top-0 z-10">
              <span>Chat with {selectedUser.name}</span>
              <button
                onClick={confirmDeleteChat}
                className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
              >
                <Trash2 size={18} /> Delete Chat
              </button>
            </div>

            <div ref={chatBoxRef} className="flex-1 p-4 overflow-y-auto space-y-4">
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
                        {m.type === "file" || m.type === "image" ? (
                          m.message.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                            <img
                              src={m.message}
                              alt="attachment"
                              className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90 transition"
                              onClick={() => window.open(m.message, "_blank")}
                            />
                          ) : (
                            <a
                              href={m.message}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-sm text-blue-200 hover:text-blue-100 break-all"
                            >
                              {m.message.split("/").pop()}
                            </a>
                          )
                        ) : (
                          <p className="whitespace-pre-wrap break-words leading-snug pr-8">
                            {m.message}
                          </p>
                        )}

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

            <div className="p-3 flex items-center gap-2 border-t dark:border-gray-700 sticky bottom-0 z-20">
            
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
                className="flex-1 border border-gray-300 dark:border-gray-700 p-2 rounded-lg text-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
