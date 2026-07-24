import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

const rootElement =
  document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Unable to find the root element.",
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);