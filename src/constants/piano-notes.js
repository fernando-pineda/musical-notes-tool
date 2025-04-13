// Lower octave (3)
import c3Audio from "../piano-notes/C3.mp3";
import cSharp3Audio from "../piano-notes/Db3.mp3";
import d3Audio from "../piano-notes/D3.mp3";
import dSharp3Audio from "../piano-notes/Eb3.mp3";
import e3Audio from "../piano-notes/E3.mp3";
import f3Audio from "../piano-notes/F3.mp3";
import fSharp3Audio from "../piano-notes/Gb3.mp3";
import g3Audio from "../piano-notes/G3.mp3";
import gSharp3Audio from "../piano-notes/Ab3.mp3";
import a3Audio from "../piano-notes/A3.mp3";
import aSharp3Audio from "../piano-notes/Bb3.mp3";
import b3Audio from "../piano-notes/B3.mp3";

// Middle octave (4)
import c4Audio from "../piano-notes/C4.mp3";
import cSharp4Audio from "../piano-notes/Db4.mp3";
import d4Audio from "../piano-notes/D4.mp3";
import dSharp4Audio from "../piano-notes/Eb4.mp3";
import e4Audio from "../piano-notes/E4.mp3";
import f4Audio from "../piano-notes/F4.mp3";
import fSharp4Audio from "../piano-notes/Gb4.mp3";
import g4Audio from "../piano-notes/G4.mp3";
import gSharp4Audio from "../piano-notes/Ab4.mp3";
import a4Audio from "../piano-notes/A4.mp3";
import aSharp4Audio from "../piano-notes/Bb4.mp3";
import b4Audio from "../piano-notes/B4.mp3";

// Higher octave (5)
import c5Audio from "../piano-notes/C5.mp3";
import cSharp5Audio from "../piano-notes/Db5.mp3";
import d5Audio from "../piano-notes/D5.mp3";
import dSharp5Audio from "../piano-notes/Eb5.mp3";
import e5Audio from "../piano-notes/E5.mp3";
import f5Audio from "../piano-notes/F5.mp3";
import fSharp5Audio from "../piano-notes/Gb5.mp3";
import g5Audio from "../piano-notes/G5.mp3";
import gSharp5Audio from "../piano-notes/Ab5.mp3";
import a5Audio from "../piano-notes/A5.mp3";
import aSharp5Audio from "../piano-notes/Bb5.mp3";
import b5Audio from "../piano-notes/B5.mp3";

const pianoNotes = [
  // Octave 3 (lower octave)
  { note: "C3", name: "Do", audio: c3Audio, type: "white" },
  { note: "C#3", name: "Do#", audio: cSharp3Audio, type: "black" },
  { note: "D3", name: "Re", audio: d3Audio, type: "white" },
  { note: "D#3", name: "Re#", audio: dSharp3Audio, type: "black" },
  { note: "E3", name: "Mi", audio: e3Audio, type: "white" },
  { note: "F3", name: "Fa", audio: f3Audio, type: "white" },
  { note: "F#3", name: "Fa#", audio: fSharp3Audio, type: "black" },
  { note: "G3", name: "Sol", audio: g3Audio, type: "white" },
  { note: "G#3", name: "Sol#", audio: gSharp3Audio, type: "black" },
  { note: "A3", name: "La", audio: a3Audio, type: "white" },
  { note: "A#3", name: "La#", audio: aSharp3Audio, type: "black" },
  { note: "B3", name: "Si", audio: b3Audio, type: "white" },

  // Octave 4 (middle octave)
  { note: "C4", name: "Do", audio: c4Audio, type: "white" },
  { note: "C#4", name: "Do#", audio: cSharp4Audio, type: "black" },
  { note: "D4", name: "Re", audio: d4Audio, type: "white" },
  { note: "D#4", name: "Re#", audio: dSharp4Audio, type: "black" },
  { note: "E4", name: "Mi", audio: e4Audio, type: "white" },
  { note: "F4", name: "Fa", audio: f4Audio, type: "white" },
  { note: "F#4", name: "Fa#", audio: fSharp4Audio, type: "black" },
  { note: "G4", name: "Sol", audio: g4Audio, type: "white" },
  { note: "G#4", name: "Sol#", audio: gSharp4Audio, type: "black" },
  { note: "A4", name: "La", audio: a4Audio, type: "white" },
  { note: "A#4", name: "La#", audio: aSharp4Audio, type: "black" },
  { note: "B4", name: "Si", audio: b4Audio, type: "white" },

  // Octave 5 (higher octave)
  { note: "C5", name: "Do₅", audio: c5Audio, type: "white" },
  { note: "C#5", name: "Do#₅", audio: cSharp5Audio, type: "black" },
  { note: "D5", name: "Re₅", audio: d5Audio, type: "white" },
  { note: "D#5", name: "Re#₅", audio: dSharp5Audio, type: "black" },
  { note: "E5", name: "Mi₅", audio: e5Audio, type: "white" },
  { note: "F5", name: "Fa₅", audio: f5Audio, type: "white" },
  { note: "F#5", name: "Fa#₅", audio: fSharp5Audio, type: "black" },
  { note: "G5", name: "Sol₅", audio: g5Audio, type: "white" },
  { note: "G#5", name: "Sol#₅", audio: gSharp5Audio, type: "black" },
  { note: "A5", name: "La₅", audio: a5Audio, type: "white" },
  { note: "A#5", name: "La#₅", audio: aSharp5Audio, type: "black" },
  { note: "B5", name: "Si₅", audio: b5Audio, type: "white" },
];

const noteStrings = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const spanishNoteStrings = [
  "Do",
  "Do#",
  "Re",
  "Re#",
  "Mi",
  "Fa",
  "Fa#",
  "Sol",
  "Sol#",
  "La",
  "La#",
  "Si",
];

export { pianoNotes, noteStrings, spanishNoteStrings };
