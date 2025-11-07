// // import express from "express";
// // import {
// //   getMessages,
// //   sendMessage,
// //   deleteMessage,
// //   deleteChat,
// // } from "../controllers/chatController.js";
// // import upload from "../middleware/uploadCloudinary.js";
// // import { verifyToken } from "../middleware/authMiddleware.js";

// // const router = express.Router();

// // /* ===============================
// //    🔹 Core Chat Routes
// // ================================= */

// // // ✅ Get all chat messages between two users
// // // GET /api/chat/:user1/:user2
// // router.get("/:user1/:user2", verifyToken, getMessages);

// // // ✅ Send a new message
// // // POST /api/chat
// // // Body: { senderId, receiverId, message }
// // router.post("/", verifyToken, upload.single("file"), sendMessage);

// // // ✅ Delete a single message
// // // DELETE /api/chat/message/:messageId
// // router.delete("/message/:messageId", verifyToken, deleteMessage);

// // // ✅ Delete entire chat between 2 users
// // // DELETE /api/chat/:user1/:user2
// // router.delete("/:user1/:user2", verifyToken, deleteChat);

// // /* ===============================
// //    🔹 File Upload Route (Cloudinary)
// // ================================= */

// // // ✅ Upload chat image or document
// // // POST /api/chat/upload
// // // router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
// // //   try {
// // //     if (!req.file) {
// // //       return res
// // //         .status(400)
// // //         .json({ success: false, message: "No file uploaded" });
// // //     }

// // //     // Cloudinary returns URL in req.file.path
// // //     const fileUrl = req.file.path;

// // //     return res.status(200).json({
// // //       success: true,
// // //       message: "File uploaded successfully",
// // //       file: {
// // //         url: fileUrl,
// // //         originalname: req.file.originalname,
// // //         mimetype: req.file.mimetype,
// // //         size: req.file.size,
// // //       },
// // //     });
// // //   } catch (err) {
// // //     console.error("❌ Chat upload error:", err);
// // //     return res.status(500).json({
// // //       success: false,
// // //       message: "Failed to upload file",
// // //       error: err.message,
// // //     });
// // //   }
// // // });

// // export default router;

// import express from "express";
// import {
//   getMessages,
//   sendMessage,
//   deleteMessage,
//   deleteChat,
// } from "../controllers/chatController.js";
// import upload from "../middleware/uploadCloudinary.js";
// import { verifyToken } from "../middleware/authMiddleware.js";

// const router = express.Router();

// /* ===============================
//    🔹 Core Chat Routes
// ================================= */

// // ✅ Get all chat messages between two users
// router.get("/:user1/:user2", verifyToken, getMessages);

// // ✅ Send a new message with optional file
// router.post("/", verifyToken, upload.single("file"), async (req, res) => {
//   try {
//     console.log("===== New chat POST request =====");
//     console.log("Body:", req.body);

//     if (req.file) {
//       console.log("📁 File uploaded in request:", {
//         originalname: req.file.originalname,
//         mimetype: req.file.mimetype,
//         size: req.file.size,
//         path: req.file.path,
//         ext: require("path").extname(req.file.originalname).toLowerCase(),
//       });
//             console.log("File uploaded:", JSON.stringify(req.file, null, 2));

//     } else {
//       console.log("No file uploaded in this message.");
//     }

//     // Call your original sendMessage controller
//     const messageData = await sendMessage(req, res);

//     console.log("✅ Message sent:", messageData);
//   } catch (err) {
//     console.error("❌ Chat POST error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error while sending chat",
//       error: err.message,
//     });
//   }
// });

// // ✅ Delete a single message
// router.delete("/message/:messageId", verifyToken, deleteMessage);

// // ✅ Delete entire chat between 2 users
// router.delete("/:user1/:user2", verifyToken, deleteChat);

// export default router;
import express from "express";
import {
  getMessages,
  sendMessage,
  deleteMessage,
  deleteChat,
} from "../controllers/chatController.js";
import upload from "../middleware/uploadCloudinary.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import path from "path";

const router = express.Router();

// ✅ Get all chat messages between two users
router.get("/:user1/:user2", verifyToken, getMessages);

// ✅ Send a new message with optional file
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
    console.log("🚀 POST /chat route hit");

  try {
    console.log("===== New chat POST request =====");
    console.log("Body:", req.body);

    if (req.file) {
      console.log("📁 File uploaded in request:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        ext: path.extname(req.file.originalname).toLowerCase(),
      });

      console.log("📄 Full file object:", JSON.stringify(req.file, null, 2));
    } else {
      console.log("No file uploaded in this message.");
    }

    // Call your original sendMessage controller
    const messageData = await sendMessage(req, res);

    console.log("✅ Message sent:", messageData);
  } catch (err) {
    console.error("❌ Chat POST error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while sending chat",
      error: err.message,
    });
  }
});

// ✅ Delete a single message
router.delete("/message/:messageId", verifyToken, deleteMessage);

// ✅ Delete entire chat between 2 users
router.delete("/:user1/:user2", verifyToken, deleteChat);

export default router;
