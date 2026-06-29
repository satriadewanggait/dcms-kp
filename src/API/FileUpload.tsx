import type { Dispatch, SetStateAction } from "react";
import { addFiles } from "@/API/Files";

const fileUpload = (
  file: File,
  uploadId: string,
  setUploads: Dispatch<SetStateAction<UploadItem[]>>,
  parentId: string,
  userId: string,
  userEmail?: string,
  fileNameOverride?: string,
) => {
  const upload = async () => {
    try {
      // Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Strip data URL prefix (e.g. "data:application/pdf;base64,")
          const commaIndex = result.indexOf(",");
          resolve(commaIndex !== -1 ? result.slice(commaIndex + 1) : result);
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
      });

      // Upload to local API with XHR (for progress tracking)
      const payload = JSON.stringify({
        fileName: fileNameOverride ?? file.name,
        fileData: base64,
      });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload/local");
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploads((prev) =>
            prev.map((upload) =>
              upload.id === uploadId ? { ...upload, progress } : upload,
            ),
          );
        };

        xhr.onload = async () => {
          if (xhr.status < 200 || xhr.status >= 300) {
            reject(new Error("Upload failed."));
            return;
          }

          const result = JSON.parse(xhr.responseText) as {
            url: string;
            publicId: string;
            resourceType: string;
          };

          try {
            await addFiles(
              result.url,
              fileNameOverride ?? file.name,
              parentId,
              userId,
              userEmail,
              result.publicId,
              result.resourceType,
              Number(file.size ?? 0),
            );

            setUploads((prev) =>
              prev.map((upload) =>
                upload.id === uploadId
                  ? { ...upload, progress: 100, fileLink: result.url }
                  : upload,
              ),
            );
            resolve();
          } catch (metadataError) {
            await fetch("/api/upload/destroy", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                publicId: result.publicId,
              }),
            }).catch(console.error);
            reject(metadataError);
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed."));
        xhr.send(payload);
      });
    } catch (error) {
      setUploads((prev) => prev.filter((upload) => upload.id !== uploadId));
      throw error;
    }
  };

  return upload();
};

export default fileUpload;
