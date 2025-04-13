import React, { useEffect, useRef, useState } from "react";
import { pianoNotes } from "../constants/piano-notes";
import { PitchDetector } from "../utils/pitch-detector";

const MicrophoneAnalyzer = ({ onNoteDetected }) => {
  const [error, setError] = useState(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const micStreamRef = useRef(null);
  const pitchDetectorRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const setupMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        micStreamRef.current = stream;

        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(stream);

        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 2048;
        source.connect(analyzerRef.current);

        pitchDetectorRef.current = new PitchDetector(
          audioContextRef.current.sampleRate
        );

        analyzePitch();
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Could not access microphone. Please check permissions.");
      }
    };

    const analyzePitch = () => {
      if (!analyzerRef.current) return;

      const bufferLength = analyzerRef.current.fftSize;
      const timeData = new Float32Array(bufferLength);

      const updatePitch = () => {
        analyzerRef.current.getFloatTimeDomainData(timeData);

        const pitch = pitchDetectorRef.current.getPitch(timeData);

        if (pitch > 0) {
          const detectedNote = findClosestNote(pitch);
          onNoteDetected(detectedNote);
        }

        animationRef.current = requestAnimationFrame(updatePitch);
      };

      updatePitch();
    };

    setupMicrophone();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, [onNoteDetected]);

  const findClosestNote = (frequency) => {
    const noteNum = 12 * Math.log2(frequency / 440) + 69;
    const noteIndex = Math.round(noteNum) % 12;
    const octave = Math.floor(Math.round(noteNum) / 12) - 1;

    const noteName = `${
      ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][
        noteIndex
      ]
    }${octave}`;

    const matchedNote = pianoNotes.find((note) => note.note === noteName);

    return matchedNote || null;
  };

  if (error) {
    return (
      <div className="bg-red-600 p-4 rounded text-white mb-4">{error}</div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 bg-gray-700 bg-opacity-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-white">Micrófono activo</span>
      </div>
    </div>
  );
};

export { MicrophoneAnalyzer };
