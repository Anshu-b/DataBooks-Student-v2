import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { LoggingProvider } from "./logging/LoggingProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LoggingProvider>
        <App />
      </LoggingProvider>
    </BrowserRouter>
  </React.StrictMode>
);
