import React, { useRef, useState, useCallback } from "react";
import jsQR from "jsqr";

export default function FileUploadTab(): React.ReactElement {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File): void => {
    setError("");
    setResult("");
    setLoading(true);
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Failed to get canvas context.");
        setLoading(false);
        URL.revokeObjectURL(url);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code) {
        setResult(code.data);
        setError("");
      } else {
        setResult("");
        setError("No QR code found in the image.");
      }
      setLoading(false);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError("Failed to load image.");
      setLoading(false);
      URL.revokeObjectURL(url);
    };
    img.src = url;
    if (imageRef.current) {
      imageRef.current.src = url;
    }
  }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    } else {
      setError("Please select a valid image file.");
    }
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));
    if (imageFile) {
      handleFile(imageFile);
    } else {
      setError("Please drop a valid image file.");
    }
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div>
      <button onClick={() => fileInputRef.current?.click()} disabled={loading}>
        {loading ? "Processing..." : "Upload Image"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFileChange}
      />
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        style={{
          border: "2px dashed #888",
          borderRadius: 8,
          padding: 24,
          margin: "16px 0",
          background: "#fafafa",
          cursor: "pointer",
        }}
      >
        Drag and drop an image here
        <div style={{ marginTop: 12 }}>
          <img ref={imageRef} alt="" style={{ maxWidth: 240, display: result || error ? "block" : "none" }} />
        </div>
      </div>
      {result && (
        <div>
          <div>
            <strong>QR Content:</strong>
          </div>
          <textarea value={result} readOnly style={{ width: "100%", minHeight: 60 }} />
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
