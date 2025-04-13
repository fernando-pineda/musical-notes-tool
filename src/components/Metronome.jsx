import React, { useState, useEffect, useRef } from "react";

const Metronome = () => {
  const [bpm, setBpm] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [count, setCount] = useState(0);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);

  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const accentAudioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(
      "https://daveceddia.com/freebies/react-metronome/click1.wav"
    );
    accentAudioRef.current = new Audio(
      "https://daveceddia.com/freebies/react-metronome/click2.wav"
    );

    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (playing) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(playClick, (60 / bpm) * 1000);
    } else {
      clearInterval(timerRef.current);
    }
  }, [playing, bpm, beatsPerMeasure]);

  const playClick = () => {
    if (count % beatsPerMeasure === 0) {
      accentAudioRef.current.play();
      accentAudioRef.current.currentTime = 0;
    } else {
      audioRef.current.play();
      audioRef.current.currentTime = 0;
    }
    setCount((prevCount) => (prevCount + 1) % beatsPerMeasure);
  };

  const startStop = () => {
    setPlaying(!playing);
    if (!playing) {
      setCount(0);
      playClick();
    }
  };

  const handleBpmChange = (e) => {
    const newBpm = parseInt(e.target.value, 10);
    if (newBpm >= 40 && newBpm <= 240) {
      setBpm(newBpm);
    }
  };

  const handleBeatsPerMeasureChange = (e) => {
    const beats = parseInt(e.target.value, 10);
    if (beats >= 2 && beats <= 12) {
      setBeatsPerMeasure(beats);
      setCount(0);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 text-gray-800">
      <h1 className="text-xl font-bold text-center mb-6">Metrónomo</h1>

      <div className="flex flex-col mb-6">
        <label className="mb-2 text-lg font-medium">BPM: {bpm}</label>
        <input
          type="range"
          min="40"
          max="240"
          value={bpm}
          onChange={handleBpmChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between mt-1 text-sm">
          <span>40</span>
          <span>240</span>
        </div>
      </div>

      <div className="flex flex-col mb-6">
        <label className="mb-2 text-lg font-medium">
          Pulsos por compás: {beatsPerMeasure}
        </label>
        <input
          type="range"
          min="2"
          max="12"
          value={beatsPerMeasure}
          onChange={handleBeatsPerMeasureChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between mt-1 text-sm">
          <span>2</span>
          <span>12</span>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex justify-center space-x-2">
          {Array.from({ length: beatsPerMeasure }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full border-2 ${
                count === i && playing
                  ? i === 0
                    ? "bg-red-500 border-red-600"
                    : "bg-blue-500 border-blue-600"
                  : "border-gray-400"
              } transition-colors duration-100`}
            />
          ))}
        </div>

        <button
          onClick={startStop}
          className={`py-3 px-6 rounded-full text-white font-bold text-lg transition-colors duration-300 ${
            playing
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {playing ? "Parar" : "Iniciar"}
        </button>

        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setBpm(Math.max(40, bpm - 5))}
            className="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 text-sm font-medium"
          >
            -5 BPM
          </button>
          <div className="flex items-center">
            <input
              type="number"
              min="40"
              max="240"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value) || 100)}
              className="w-16 text-center border border-gray-300 rounded-md p-2"
            />
          </div>
          <button
            onClick={() => setBpm(Math.min(240, bpm + 5))}
            className="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 text-sm font-medium"
          >
            +5 BPM
          </button>
        </div>
      </div>
    </div>
  );
};

export { Metronome };
