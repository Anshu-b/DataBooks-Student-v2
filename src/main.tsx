import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { LoggingProvider } from "./logging/LoggingProvider";
import { RoleProvider } from "./state/RoleContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <LoggingProvider>
          <App />
        </LoggingProvider>
      </RoleProvider>
    </BrowserRouter>
  </React.StrictMode>
);
