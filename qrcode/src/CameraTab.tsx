import React, { useRef, useState, useEffect } from "react";
import jsQR from "jsqr";

export default function CameraTab(): React.ReactElement {
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line
  }, []);

  async function startCamera(): Promise<void> {
    setError("");
    setResult("");
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      scanLoop();
    } catch (e) {
      setError("Failed to access camera.");
      setScanning(false);
    }
  }

  function stopCamera(): void {
    setScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function scanLoop(): void {
    if (!scanning) return;
    if (videoRef.current && videoRef.current.readyState === 4) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code) {
          setResult(code.data);
        }
      }
    }
    setTimeout(scanLoop, 1000);
  }

  return (
    <div>
      {!scanning ? (
        <button onClick={startCamera}>Start Camera</button>
      ) : (
        <button onClick={stopCamera}>Stop Camera</button>
      )}
      <div style={{ margin: "16px 0" }}>
        <video
          ref={videoRef}
          style={{ width: 320, height: 240, background: "#000" }}
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
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
