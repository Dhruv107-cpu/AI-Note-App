import { useState, useEffect, useRef } from "react";



function App() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const API_BASE = "http://localhost:8000";

  // ===============================
  // Fetch Notes
  // ===============================
  const fetchNotes = async () => {
    const res = await fetch(`${API_BASE}/notes/`);
    const data = await res.json();
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // ===============================
  // Create Text Note
  // ===============================
  const createNote = async () => {
    if (!note.trim()) return alert("Write something first!");

    await fetch(`${API_BASE}/notes/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: note }),
    });

    setNote("");
    fetchNotes();
  };

  // ===============================
  // Delete Single Note
  // ===============================
  const deleteNote = async (id) => {
    await fetch(`${API_BASE}/notes/${id}`, {
      method: "DELETE",
    });
    fetchNotes();
  };

  // ===============================
  // Clear All Notes
  // ===============================
  const clearAllNotes = async () => {
    await fetch(`${API_BASE}/notes/`, {
      method: "DELETE",
    });
    fetchNotes();
  };

  // ===============================
  // Ask Question
  // ===============================
  const askQuestion = async () => {
    if (!question.trim()) return alert("Ask something!");

    const res = await fetch(`${API_BASE}/notes/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setAnswer(data.answer);
  };

  // ===============================
  // Start Recording
  // ===============================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!window.MediaRecorder) {
        alert("MediaRecorder not supported in this browser.");
        return;
      }

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current);

        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        const res = await fetch(`${API_BASE}/notes/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        // Put transcription into textarea
        setNote(data.transcription);

        // Clear chunks
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
      alert("Microphone access failed.");
    }
  };

  // ===============================
  // Stop Recording
  // ===============================
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

   return (
  <div className="min-h-screen flex items-center justify-center p-6">
    <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">

      <h1 className="text-4xl font-bold text-center mb-8">
        🧠 AI Voice Notes
      </h1>

      {/* Create Note */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Create / Edit Note</h2>
        <textarea
          className="w-full p-3 rounded-xl bg-black/30 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows="3"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Speak or type your thoughts..."
        />
        <button
          onClick={createNote}
          className="mt-3 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:scale-105 transition"
        >
          Save Note
        </button>
      </div>

      {/* Voice */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Voice Input</h2>
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-6 py-2 bg-green-500 rounded-xl hover:scale-105 transition"
          >
            🎙 Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-6 py-2 bg-red-500 rounded-xl hover:scale-105 transition"
          >
            ⏹ Stop Recording
          </button>
        )}
      </div>

      {/* Notes */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Saved Notes</h2>
        <button
          onClick={clearAllNotes}
          className="mb-3 px-4 py-1 bg-red-600 rounded-lg"
        >
          Clear All
        </button>
        <ul className="space-y-2">
          {notes.map((n) => (
            <li
              key={n.id}
              className="flex justify-between bg-black/30 p-3 rounded-xl border border-white/10"
            >
              {n.content}
              <button
                onClick={() => deleteNote(n.id)}
                className="text-red-400"
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Ask */}
      <div>
        <h2 className="text-xl mb-2">Ask AI</h2>
        <input
          className="w-full p-3 rounded-xl bg-black/30 border border-white/20 mb-3"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your notes..."
        />
        <button
          onClick={askQuestion}
          className="px-6 py-2 bg-blue-500 rounded-xl hover:scale-105 transition"
        >
          Ask
        </button>

        {answer && (
          <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/10">
            <h3 className="font-semibold mb-2">Answer:</h3>
            <p>{answer}</p>
          </div>
        )}
      </div>

    </div>
  </div>
);

}



export default App;
