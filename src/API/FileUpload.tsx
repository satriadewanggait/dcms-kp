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
      const formData = new FormData();
      formData.append("fileName", fileNameOverride ?? file.name);
      formData.append("file", file);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload/local");

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
            let msg = "Upload failed.";
            try {
              const body = JSON.parse(xhr.responseText);
              if (body?.error) msg = body.error;
            } catch {}
            reject(new Error(msg));
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
        xhr.send(formData);
      });
    } catch (error) {
      setUploads((prev) => prev.filter((upload) => upload.id !== uploadId));
      throw error;
    }
  };

  return upload();
};

export default fileUpload;
