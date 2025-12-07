import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";   // ✅ ../App 절대 아님. ./App 이게 정답

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
