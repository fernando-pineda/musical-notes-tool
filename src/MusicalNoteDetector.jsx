import { useState, useRef } from "react";
import {
  Piano,
  AudioFileAnalyzer,
  MicrophoneAnalyzer,
  NoteDisplay,
  Metronome,
} from "./components";

export function NoteDetector() {
  const [isMicActive, setIsMicActive] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (file) => {
    if (file) {
      setAudioFile(file);
      setIsMicActive(false);
    }
  };

  const toggleMicrophone = () => {
    if (!audioFile) {
      setIsMicActive(!isMicActive);
    }
  };

  const clearAudioFile = () => {
    setAudioFile(null);
    setCurrentNote(null);
    setIsMicActive(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen">
      <div className="w-full p-4 flex rounded-lg bg-white">
        <div className="p-6">
          <div className="rounded-lg p-6 mb-6">
            <div className="flex justify-center mb-6 gap-4">
              <button
                onClick={toggleMicrophone}
                disabled={!!audioFile}
                className={`text-white px-6 py-3 rounded-full font-medium transition-all ${
                  isMicActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } ${audioFile ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isMicActive ? "Detener Mic." : "Iniciar Mic."}
              </button>

              <label className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-medium cursor-pointer transition-all text-white">
                Subir Audio
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
              </label>

              {audioFile && (
                <button
                  onClick={clearAudioFile}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-full font-medium transition-all"
                >
                  Clear Audio
                </button>
              )}
            </div>

            <NoteDisplay note={currentNote} />

            {isMicActive && !audioFile && (
              <MicrophoneAnalyzer onNoteDetected={setCurrentNote} />
            )}

            {audioFile && (
              <AudioFileAnalyzer
                file={audioFile}
                onNoteDetected={setCurrentNote}
              />
            )}
          </div>

          <div className="text-center text-gray-400 text-sm">
            <p>Usa el micrófono para obtener tu nota en vivo</p>
            <p>O también puedes subir un audio para analizar las notas</p>
            <small>Recuerda que no puedes hacer ambas</small>
          </div>

          <Metronome />
        </div>

        {/* Piano */}
        <Piano detectedNote={currentNote?.name} />
      </div>
    </div>
  );
}
