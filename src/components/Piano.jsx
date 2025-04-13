import * as React from "react";
import { pianoNotes } from "../constants";

const Piano = ({ detectedNote }) => {
  // Sequences management
  const [sequences, setSequences] = React.useState(() => {
    // Load sequences from localStorage if available
    const savedSequences = localStorage.getItem("pianoSequences");
    return savedSequences ? JSON.parse(savedSequences) : [];
  });
  const [currentSequence, setCurrentSequence] = React.useState(null);
  const [sequenceName, setSequenceName] = React.useState("");

  // Current sequence data
  const [sequence, setSequence] = React.useState([]);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentDuration, setCurrentDuration] = React.useState(0.5); // in seconds

  // Track currently playing sequence in Play All mode
  const [playingAllSequences, setPlayingAllSequences] = React.useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = React.useState(null);

  const [lastPlayedNote, setLastPlayedNote] = React.useState(null);

  // Save sequences to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem("pianoSequences", JSON.stringify(sequences));
  }, [sequences]);

  // Load a sequence when selected
  React.useEffect(() => {
    if (currentSequence !== null) {
      const selectedSequence = sequences.find(
        (seq) => seq.id === currentSequence
      );
      if (selectedSequence) {
        setSequence(selectedSequence.notes);
        setSequenceName(selectedSequence.name);
      }
    } else {
      setSequence([]);
      setSequenceName("");
    }
  }, [currentSequence, sequences]);

  const isNoteMatching = React.useMemo(() => {
    if (!detectedNote || !lastPlayedNote) return false;
    return detectedNote === lastPlayedNote;
  }, [detectedNote, lastPlayedNote]);

  const playPianoNote = (audioSrc, noteName, noteCode) => {
    const audio = new Audio(audioSrc);
    audio.play();
    setLastPlayedNote(noteName);

    if (isRecording) {
      setSequence((prev) => [
        ...prev,
        {
          type: "note",
          note: noteCode,
          name: noteName,
          audio: audioSrc,
          duration: currentDuration,
        },
      ]);
    }
  };

  const addPause = () => {
    if (isRecording) {
      setSequence((prev) => [
        ...prev,
        {
          type: "pause",
          duration: currentDuration,
        },
      ]);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (isPlaying) {
      setIsPlaying(false);
    }
  };

  const clearSequence = () => {
    setSequence([]);
  };

  const playSequence = async (notesToPlay = sequence, sequenceId = null) => {
    if (isRecording) {
      setIsRecording(false);
    }

    if (notesToPlay.length === 0) return;

    setIsPlaying(true);
    if (sequenceId !== null) {
      setCurrentlyPlayingId(sequenceId);
    }

    for (let i = 0; i < notesToPlay.length; i++) {
      const item = notesToPlay[i];

      if (item.type === "note") {
        const audio = new Audio(item.audio);
        setLastPlayedNote(item.name);
        audio.play();
      }

      // Wait for the duration of this item
      await new Promise((resolve) => setTimeout(resolve, item.duration * 1000));
    }

    setIsPlaying(false);
    if (sequenceId !== null) {
      setCurrentlyPlayingId(null);
    }

    // Return a promise that resolves when the sequence finishes
    return Promise.resolve();
  };

  // Play all sequences in order
  const playAllSequences = async () => {
    if (sequences.length === 0) return;

    setPlayingAllSequences(true);

    try {
      for (let i = 0; i < sequences.length; i++) {
        const seq = sequences[i];
        await playSequence(seq.notes, seq.id);

        // Small pause between sequences
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } finally {
      setPlayingAllSequences(false);
      setCurrentlyPlayingId(null);
    }
  };

  const handleDurationChange = (e) => {
    setCurrentDuration(parseFloat(e.target.value));
  };

  const updateNoteDuration = (index, newDuration) => {
    setSequence((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, duration: parseFloat(newDuration) } : item
      )
    );
  };

  const removeNoteFromSequence = (index) => {
    setSequence((prev) => prev.filter((_, i) => i !== index));
  };

  // New functions for sequence management
  const createNewSequence = () => {
    if (isRecording) {
      setIsRecording(false);
    }
    setCurrentSequence(null);
    setSequence([]);
    setSequenceName("Nueva secuencia");
  };

  const saveCurrentSequence = () => {
    if (sequence.length === 0) return;

    const name = sequenceName.trim() || "Secuencia sin nombre";

    if (currentSequence === null) {
      // Create new sequence
      const newSequence = {
        id: Date.now(),
        name,
        notes: sequence,
      };
      setSequences((prev) => [...prev, newSequence]);
      setCurrentSequence(newSequence.id);
    } else {
      // Update existing sequence
      setSequences((prev) =>
        prev.map((seq) =>
          seq.id === currentSequence ? { ...seq, name, notes: sequence } : seq
        )
      );
    }
  };

  const deleteSequence = (id) => {
    setSequences((prev) => prev.filter((seq) => seq.id !== id));
    if (currentSequence === id) {
      setCurrentSequence(null);
      setSequence([]);
      setSequenceName("");
    }
  };

  // Export sequences functionality
  const exportSequences = () => {
    // Create a JSON file with sequences data
    const data = JSON.stringify(sequences, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "piano-sequences.json";
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Import sequences functionality
  const importSequences = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedSequences = JSON.parse(e.target.result);

        // Validate imported data structure
        if (!Array.isArray(importedSequences)) {
          throw new Error("Invalid sequence format");
        }

        // Add imported sequences to existing ones, avoiding duplicates by ID
        setSequences((prevSequences) => {
          // Get existing IDs
          const existingIds = new Set(prevSequences.map((seq) => seq.id));

          // Filter out duplicates and add new ones
          const newSequences = importedSequences.filter(
            (seq) => !existingIds.has(seq.id)
          );

          return [...prevSequences, ...newSequences];
        });

        alert(
          `${importedSequences.length} secuencias importadas correctamente`
        );
      } catch (error) {
        console.error("Error importing sequences:", error);
        alert(
          "Error al importar secuencias. Verifique el formato del archivo."
        );
      }

      // Reset file input
      event.target.value = "";
    };

    reader.readAsText(file);
  };

  // File input reference for the import button
  const fileInputRef = React.useRef(null);

  return (
    <div className="bg-white p-6 max-w-5xl">
      {/* Note detection indicator */}
      <div className="mb-4 p-3 rounded-lg border bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="text-md font-semibold text-gray-700">
            Nota detectada:
          </span>
          <div
            className={`px-4 py-2 rounded-lg ${
              detectedNote
                ? isNoteMatching
                  ? "bg-green-100 border-green-500 border text-green-800"
                  : "bg-yellow-100 border-yellow-500 border text-yellow-800"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {detectedNote ? (
              <>
                <span className="font-bold">{detectedNote}</span>
                <span className="ml-2">
                  {isNoteMatching
                    ? `= ${lastPlayedNote}`
                    : `≠ ${lastPlayedNote || "Ninguna nota"}`}
                </span>
              </>
            ) : (
              "Ninguna nota detectada"
            )}
          </div>
        </div>
      </div>

      {/* Sequences management */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-semibold text-gray-700">
            Mis Secuencias
          </h3>

          {sequences.length > 1 && (
            <button
              onClick={playAllSequences}
              disabled={isPlaying || playingAllSequences}
              className={`px-3 py-1 text-sm rounded-lg ${
                playingAllSequences
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {playingAllSequences
                ? "Reproduciendo todo..."
                : "Reproducir todas"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {sequences.length > 0 ? (
            sequences.map((seq) => (
              <div
                key={seq.id}
                className={`relative group px-3 py-2 rounded-lg border ${
                  currentlyPlayingId === seq.id
                    ? "bg-green-100 border-green-400 shadow-md"
                    : currentSequence === seq.id
                    ? "bg-blue-100 border-blue-400"
                    : "bg-white border-gray-300 hover:bg-blue-50"
                } cursor-pointer transition-colors`}
                onClick={() => setCurrentSequence(seq.id)}
              >
                <div className="flex items-center">
                  <span className="font-medium">{seq.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({seq.notes.length}{" "}
                    {seq.notes.length === 1 ? "nota" : "notas"})
                  </span>

                  {/* Play individual sequence button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isPlaying && !playingAllSequences) {
                        playSequence(seq.notes, seq.id);
                      }
                    }}
                    disabled={isPlaying || playingAllSequences}
                    className={`ml-2 p-1 text-xs rounded ${
                      currentlyPlayingId === seq.id
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    {currentlyPlayingId === seq.id ? "▶️..." : "▶️"}
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSequence(seq.id);
                  }}
                  className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic">No hay secuencias guardadas</p>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={createNewSequence}
            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white"
          >
            Nueva secuencia
          </button>

          {/* Export and Import buttons */}
          <button
            onClick={exportSequences}
            disabled={sequences.length === 0}
            className={`px-4 py-2 rounded-lg ${
              sequences.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            }`}
          >
            Exportar secuencias
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            Importar secuencias
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={importSequences}
            accept=".json"
            className="hidden"
          />

          {sequence.length > 0 && (
            <button
              onClick={saveCurrentSequence}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
            >
              Guardar secuencia
            </button>
          )}
        </div>
      </div>

      {/* Current sequence editor */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3 flex-grow">
            <span className="text-md font-semibold text-gray-700">
              Secuencia actual:
            </span>
            <input
              type="text"
              value={sequenceName}
              onChange={(e) => setSequenceName(e.target.value)}
              placeholder="Nombre de la secuencia"
              className="flex-grow p-2 border border-gray-300 rounded-lg"
              disabled={isRecording || isPlaying}
            />
          </div>
        </div>

        <div className="flex justify-between mb-4">
          <div className="flex space-x-2">
            <button
              onClick={toggleRecording}
              className={`px-4 py-2 rounded-lg ${
                isRecording
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              {isRecording ? "Detener grabación" : "Grabar secuencia"}
            </button>
            <button
              onClick={() => playSequence()}
              disabled={
                isPlaying || playingAllSequences || sequence.length === 0
              }
              className={`px-4 py-2 rounded-lg ${
                isPlaying || playingAllSequences
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : sequence.length === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isPlaying ? "Reproduciendo..." : "Reproducir"}
            </button>
            <button
              onClick={clearSequence}
              disabled={
                sequence.length === 0 || isPlaying || playingAllSequences
              }
              className={`px-4 py-2 rounded-lg ${
                sequence.length === 0 || isPlaying || playingAllSequences
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white"
              }`}
            >
              Limpiar
            </button>
            {isRecording && (
              <button
                onClick={addPause}
                className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white"
              >
                Añadir pausa
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Duración:</label>
            <select
              value={currentDuration}
              onChange={handleDurationChange}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="0.25">¼ segundo</option>
              <option value="0.5">½ segundo</option>
              <option value="1">1 segundo</option>
              <option value="1.5">1.5 segundos</option>
              <option value="2">2 segundos</option>
            </select>
          </div>
        </div>

        {/* Sequence visualization */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 min-h-[60px] max-h-[150px] overflow-y-auto">
          {sequence.length === 0 ? (
            <p className="text-gray-400 text-center italic">
              La secuencia está vacía
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sequence.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center px-3 py-1 rounded-lg ${
                    item.type === "note"
                      ? "bg-blue-100 border border-blue-300"
                      : "bg-purple-100 border border-purple-300"
                  }`}
                >
                  {item.type === "note" ? (
                    <>
                      <span className="font-medium mr-1">{item.name}</span>
                      <span className="text-xs text-gray-500 mr-1">
                        ({item.note})
                      </span>
                    </>
                  ) : (
                    <span className="font-medium">Pausa</span>
                  )}
                  <select
                    value={item.duration}
                    onChange={(e) => updateNoteDuration(index, e.target.value)}
                    className="text-xs bg-gray-200 px-1 rounded ml-1 border-none"
                    disabled={isPlaying || playingAllSequences}
                  >
                    <option value="0.25">0.25s</option>
                    <option value="0.5">0.5s</option>
                    <option value="1">1s</option>
                    <option value="1.5">1.5s</option>
                    <option value="2">2s</option>
                  </select>
                  <button
                    onClick={() => removeNoteFromSequence(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    disabled={isPlaying || playingAllSequences}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Piano */}
      <div className="relative inline-flex h-64 my-8 overflow-x-auto">
        {/* White keys */}
        <div className="flex relative z-10">
          {pianoNotes
            .filter((note) => note.type === "white")
            .map((pianoNote) => (
              <button
                key={pianoNote.note}
                onClick={() =>
                  playPianoNote(pianoNote.audio, pianoNote.name, pianoNote.note)
                }
                className="w-12 h-64 bg-white border border-gray-300 rounded-b-lg shadow-md hover:bg-gray-50 active:bg-gray-100 transition-colors flex flex-col justify-end items-center pb-2 relative z-10"
              >
                <span className="text-sm font-medium text-gray-700">
                  {pianoNote.name}
                </span>
                <span className="text-xs text-gray-500">{pianoNote.note}</span>
              </button>
            ))}
        </div>

        {/* Black keys - fixed positioning */}
        <div className="absolute top-0 left-0 h-40 z-20">
          {pianoNotes.map((pianoNote, index) => {
            if (pianoNote.type === "black") {
              // Get the white key index that comes before this black key
              const whiteKeysBefore = pianoNotes
                .filter((n) => n.type === "white")
                .findIndex(
                  (n) =>
                    n.note.charAt(0) === pianoNote.note.charAt(0) &&
                    n.note.includes(pianoNote.note.charAt(2))
                );

              // Calculate position based on white key layout
              // Each white key is 3rem (12px * 3 = 36px) wide
              const position = whiteKeysBefore * 48 + 36 - 16; // 48px per white key, center black key

              return (
                <button
                  key={pianoNote.note}
                  onClick={() =>
                    playPianoNote(
                      pianoNote.audio,
                      pianoNote.name,
                      pianoNote.note
                    )
                  }
                  className="w-8 h-40 bg-black hover:bg-gray-800 active:bg-gray-700 transition-colors absolute rounded-b-lg flex flex-col justify-end items-center pb-2"
                  style={{ left: `${position}px` }}
                >
                  <span className="text-xs font-medium text-white">
                    {pianoNote.name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {pianoNote.note}
                  </span>
                </button>
              );
            }
            return null;
          })}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600 text-center">
          {isRecording
            ? "Grabando: Pulsa las teclas para añadirlas a la secuencia"
            : playingAllSequences
            ? "Reproduciendo todas las secuencias..."
            : "Pulsa cualquier tecla para escuchar su sonido"}
        </p>
      </div>

      {/* Audio preload */}
      <div className="hidden">
        {pianoNotes.map((note) => (
          <audio key={note.note} preload="auto">
            <source src={note.audio} type="audio/mp3" />
          </audio>
        ))}
      </div>
    </div>
  );
};

export { Piano };
