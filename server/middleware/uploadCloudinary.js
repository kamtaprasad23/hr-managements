// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";
// import path from "path";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   // params: async (req, file) => {
//   //   const folder = "hr_management/chat_uploads";
//   //   const isImage = file.mimetype.startsWith("image/");
//   //   const resourceType = isImage ? "image" : "raw";

//   //   // 🧹 Sanitize filename
//   //   const cleanName = path
//   //     .parse(file.originalname)
//   //     .name.replace(/\s+/g, "_")
//   //     .replace(/[()]/g, "")
//   //     .replace(/[%]/g, "")
//   //     .replace(/[^a-zA-Z0-9_\-]/g, "");

//   //   return {
//   //     folder,
//   //     resource_type: resourceType,
//   //     allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "docx", "xlsx"],
//   //     transformation: isImage
//   //       ? [{ width: 1000, height: 1000, crop: "limit" }]
//   //       : [],
//   //     public_id: cleanName, // 👈 Clean readable name
//   //   };
//   // },
// params: async (req, file) => {


//   const folder = "hr_management/chat_uploads";

//   const ext = path.extname(file.originalname).toLowerCase();
//   const isImage = file.mimetype.startsWith("image/");
// const isRawDoc = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".xlsm"].includes(ext);
//   const resourceType = isImage ? "image" : isRawDoc ? "raw" : "auto";

// console.log("Uploading file:", {
//   name: file.originalname,
//   mimetype: file.mimetype,
//   ext,
//   resourceType
// });

//   const cleanName = path
//     .parse(file.originalname)
//     .name.replace(/\s+/g, "_")
//     .replace(/[()]/g, "")
//     .replace(/[%]/g, "")
//     .replace(/[^a-zA-Z0-9_\-]/g, "");
// return {
//   folder,
//   resource_type: resourceType,
//   allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "docx", "xlsx", "xlsm", "xls"],
//   transformation: isImage ? [{ width: 1000, height: 1000, crop: "limit" }] : [],
//   public_id: `${cleanName}_${Date.now()}`,
// };

// }


// });

// const upload = multer({ storage });

// export default upload;


// //abhi idher tk hi krna hai control z mt kro
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import path from "path";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = "hr_management/chat_uploads";

    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = file.mimetype.startsWith("image/");
    const isRawDoc = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".xlsm"].includes(ext);
    const resourceType = isImage ? "image" : isRawDoc ? "raw" : "auto";

    // 🔹 Debug log before upload
    console.log("Preparing file for Cloudinary upload:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      ext,
      resourceType,
    });

    const cleanName = path
      .parse(file.originalname)
      .name.replace(/\s+/g, "_")
      .replace(/[()]/g, "")
      .replace(/[%]/g, "")
      .replace(/[^a-zA-Z0-9_\-]/g, "");

    return {
      folder,
      resource_type: resourceType,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "docx", "xlsx", "xlsm", "xls"],
      transformation: isImage ? [{ width: 1000, height: 1000, crop: "limit" }] : [],
      public_id: `${cleanName}_${Date.now()}`,
    };
  },
});

const upload = multer({ storage });

export default upload;
