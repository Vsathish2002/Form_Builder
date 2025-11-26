import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { tolgee } from "./tolgee";
import { TolgeeProvider } from "@tolgee/react";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <AuthProvider>
    <BrowserRouter>
      <TolgeeProvider tolgee={tolgee}>
        <App />
      </TolgeeProvider>
    </BrowserRouter>
  </AuthProvider>
  // </React.StrictMode>
);
