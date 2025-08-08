import React from "react";
import MainTabs from "./MainTabs";
import "./App.css";

export default function App(): React.ReactElement {
  return (
    <div>
      <h1>QR Code Reader</h1>
      <MainTabs />
    </div>
  );
}
