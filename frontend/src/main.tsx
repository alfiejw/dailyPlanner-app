import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

// Create the React root once and render the app shell.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
