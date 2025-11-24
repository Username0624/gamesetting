import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx"; // <- 這個檔案就是你從畫布複製的 component

createRoot(document.getElementById("root")).render(<App />);
