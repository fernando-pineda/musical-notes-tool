import React, { useEffect, useRef, useState } from "react";
import { pianoNotes } from "../constants/piano-notes";
import { PitchDetector } from "../utils/pitch-detector";

const AudioFileAnalyzer = ({ file, onNoteDetected }) => {
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(null);

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const pitchDetectorRef = useRef(null);
  const animationRef = useRef(null);

  // Crear URL para el archivo de audio
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);

      // Limpiar URL al desmontar
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Configurar analizador de audio y detector de tono
  useEffect(() => {
    if (!audioUrl) return;

    const setupAudioAnalyzer = async () => {
      try {
        // Crear contexto de audio si no existe
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext ||
            window.webkitAudioContext)();
        }

        // Configurar analizador
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 2048;

        // Inicializar detector de tono
        pitchDetectorRef.current = new PitchDetector(
          audioContextRef.current.sampleRate
        );
      } catch (err) {
        console.error("Error setting up audio analyzer:", err);
        setError("Error initializing audio analyzer");
      }
    };

    setupAudioAnalyzer();

    return () => {
      // Limpiar al desmontar
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }

      if (analyzerRef.current) {
        analyzerRef.current.disconnect();
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioUrl]);

  // Manejar eventos de audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);

      // Conectar nodo de fuente si no está conectado
      if (!sourceNodeRef.current && audioContextRef.current) {
        const source = audioContextRef.current.createMediaElementSource(audio);
        source.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
        sourceNodeRef.current = source;
      }

      // Comenzar análisis
      analyzePitch();
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const analyzePitch = () => {
    if (!analyzerRef.current) return;

    const bufferLength = analyzerRef.current.fftSize;
    const timeData = new Float32Array(bufferLength);

    const updatePitch = () => {
      analyzerRef.current.getFloatTimeDomainData(timeData);

      // Detectar tono usando el algoritmo YIN
      const pitch = pitchDetectorRef.current.getPitch(timeData);

      if (pitch > 0) {
        // Encontrar la nota más cercana
        const detectedNote = findClosestNote(pitch);
        onNoteDetected(detectedNote);
      }

      animationRef.current = requestAnimationFrame(updatePitch);
    };

    updatePitch();
  };

  const findClosestNote = (frequency) => {
    // Algoritmo para encontrar la nota más cercana basado en la frecuencia
    // Usamos la fórmula: note = 12 * log2(frequency / 440) + 69
    // Donde 440 es la frecuencia de A4 y 69 es su número MIDI

    // Calcular el número de nota MIDI
    const noteNum = 12 * Math.log2(frequency / 440) + 69;
    const noteIndex = Math.round(noteNum) % 12;
    const octave = Math.floor(Math.round(noteNum) / 12) - 1;

    // Construir el nombre de la nota (Ej: C4, A#3)
    const noteName = `${
      ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
        noteIndex
      ]
    }${octave}`;

    // Encontrar la nota en nuestro array de pianoNotes
    const matchedNote = pianoNotes.find((note) => note.note === noteName);

    return matchedNote || null;
  };

  // Funciones de control de reproducción
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const seekAudio = (e) => {
    const seekPosition = e.nativeEvent.offsetX / e.target.clientWidth;
    const newTime = duration * seekPosition;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  if (error) {
    return (
      <div className="bg-red-600 p-4 rounded text-white mb-4">{error}</div>
    );
  }

  return (
    <div className="p-4 bg-gray-700 bg-opacity-50 rounded-lg">
      <audio ref={audioRef} src={audioUrl} className="hidden" />

      <div className="mb-2 text-sm font-medium">
        {file?.name || "Audio file"}
      </div>

      {/* Custom Audio Controls */}
      <div className="flex flex-col">
        {/* Waveform/Seek Bar */}
        <div
          className="h-16 bg-gray-600 rounded cursor-pointer mb-2 relative overflow-hidden"
          onClick={seekAudio}
        >
          {/* Progress Bar */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 opacity-50"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>

          {/* Current position indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7-.75a.75.75 0 00-.75.75v13.5a.75.75 0 00.75.75H16.5a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H13.75z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <div className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {isPlaying && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Analyzing audio...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { AudioFileAnalyzer };
