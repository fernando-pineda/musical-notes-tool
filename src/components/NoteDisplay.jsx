import React from "react";

const NoteDisplay = ({ note }) => {
  return (
    <div className="text-center min-h-[120px] flex items-center justify-center">
      <div>
        {note ? (
          <div className="animate-fadeIn">
            <div className="text-4xl font-bold mb-4">{note.name}</div>
            <div className="text-xl text-gray-400">{note.note}</div>
          </div>
        ) : (
          <div className="text-xl text-gray-500 italic">
            Listening for notes...
          </div>
        )}
      </div>
    </div>
  );
};

export { NoteDisplay };
