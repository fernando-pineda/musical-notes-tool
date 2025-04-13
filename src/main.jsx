import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { NoteDetector } from "./MusicalNoteDetector.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NoteDetector />
  </StrictMode>
);
