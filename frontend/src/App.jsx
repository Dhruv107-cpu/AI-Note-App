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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          🧠 AI Voice Notes
        </h1>

        {/* Create Note Card */}
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl mb-4 font-semibold">Create / Edit Note</h2>

          <textarea
            className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write or record your note..."
          />

          <div className="flex gap-4 mt-4">
            <button
              onClick={createNote}
              className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg transition"
            >
              Save Note
            </button>

            {!recording ? (
              <button
                onClick={startRecording}
                className="bg-pink-600 hover:bg-pink-700 px-5 py-2 rounded-lg transition"
              >
                🎙️ Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-600 animate-pulse px-5 py-2 rounded-lg"
              >
                ⏹ Stop Recording
              </button>
            )}
          </div>
        </div>

        {/* Saved Notes */}
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl mb-4 font-semibold">Saved Notes</h2>

          <div className="space-y-3">
            {notes.map((n) => (
              <div
                key={n.id}
                className="flex justify-between items-center bg-black/40 p-3 rounded-lg"
              >
                <span>{n.content}</span>
                <button
                  onClick={() => deleteNote(n.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ask Section */}
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl mb-4 font-semibold">Ask AI</h2>

          <input
            className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What did I say about internship?"
          />

          <button
            onClick={askQuestion}
            className="mt-4 bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg transition"
          >
            Ask
          </button>

          {answer && (
            <div className="mt-6 bg-black/50 p-4 rounded-lg border border-green-500">
              <p className="text-green-400 font-semibold">Answer:</p>
              <p className="mt-2">{answer}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}



export default App;
