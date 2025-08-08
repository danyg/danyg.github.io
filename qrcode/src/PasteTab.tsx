import React, { useState, useRef } from "react";
import jsQR from "jsqr";

export default function PasteTab(): React.ReactElement {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);

  async function handlePaste(): Promise<void> {
    setError("");
    setResult("");
    setLoading(true);
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        setError("Clipboard image reading is not supported in this browser.");
        setLoading(false);
        return;
      }
      const items = await navigator.clipboard.read();
      let found = false;
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const url = URL.createObjectURL(blob);
            decodeImage(url);
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found) {
        setError("No image found in clipboard. Please copy an image first.");
        setLoading(false);
      }
    } catch (e) {
      setError("Failed to read from clipboard.");
      setLoading(false);
    }
  }

  function decodeImage(url: string): void {
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
  }

  return (
    <div>
      <button onClick={handlePaste} disabled={loading}>
        {loading ? "Processing..." : "Paste Image from Clipboard"}
      </button>
      <div style={{ margin: "16px 0" }}>
        <img ref={imageRef} alt="" style={{ maxWidth: 240, display: result || error ? "block" : "none" }} />
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
