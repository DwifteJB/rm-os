import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/index.css";
import MainPage from "./pages/main";

import { AppProvider } from "./components/mainAppContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <MainPage />
    </AppProvider>
  </StrictMode>,
);
