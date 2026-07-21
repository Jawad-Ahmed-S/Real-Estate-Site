import multer from "multer";
import type{ Request } from "express";
import type { FileFilterCallback} from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req:Request, file:Express.Multer.File, cb:FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};
 
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("avatar");

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("images", 10); // for property listings later