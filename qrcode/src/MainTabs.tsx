import React, { useState } from "react";
import PasteTab from "./PasteTab";
import FileUploadTab from "./FileUploadTab";
import CameraTab from "./CameraTab";

type TabKey = "paste" | "upload" | "camera";

const TABS: { key: TabKey; label: string }[] = [
  { key: "paste", label: "Paste" },
  { key: "upload", label: "Upload" },
  { key: "camera", label: "Camera" },
];

export default function MainTabs(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabKey>("paste");

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              fontWeight: activeTab === tab.key ? "bold" : "normal",
              borderBottom: activeTab === tab.key ? "2px solid #333" : "none",
              background: "none",
              border: "none",
              padding: "8px 16px",
              cursor: "pointer",
            }}
            data-testid={`tab-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab === "paste" && <PasteTab />}
        {activeTab === "upload" && <FileUploadTab />}
        {activeTab === "camera" && <CameraTab />}
      </div>
    </div>
  );
}
