import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { LoggingProvider } from "./logging/LoggingProvider";
import { FirebaseLogger } from "./logging/FirebaseLogger";
import { createBatchTimestamp } from "./logging/createBatchTimestamp";

const logger = new FirebaseLogger({
  userId: "Eli",              // later: dynamic
  gameId: "alien-invasion",
  batchTimestamp: createBatchTimestamp(),
});


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
