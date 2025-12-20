import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { LoggingProvider } from "./logging/LoggingProvider";
import { ConsoleLogger } from "./logging/consoleLogger";

const logger = new ConsoleLogger();

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <LoggingProvider logger={logger}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LoggingProvider>
  </React.StrictMode>
);
