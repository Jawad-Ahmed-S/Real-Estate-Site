import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js"; 
import type { UploadApiOptions,UploadApiResponse,UploadApiErrorResponse } from "cloudinary";

export const uploadBufferToCloudinary = (buffer:Buffer, folder:string, options:UploadApiOptions = {}):Promise<UploadApiResponse> => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", ...options },
      (error?:UploadApiErrorResponse, result?:UploadApiResponse) => {
        if (error) return reject(error);
        if (result) resolve(result);
      } 
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const deleteFromCloudinary = async (public_id:string):Promise<void> => {
  if (!public_id) return;
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    if(err instanceof Error)
    console.log("Cloudinary delete error:", err.message);
  }
};