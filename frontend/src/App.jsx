import { useState, useEffect, useRef } from "react";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const API_BASE = "https://ai-note-backend-6sxs.onrender.com";

  // ===============================
  // LOGIN SCREEN
  // ===============================
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

  useEffect(() => {
  if (token) {
    fetchNotes();
  }
}, [token]);

// ===============================
  // Fetch Notes
  // ===============================
  const fetchNotes = async () => {
  try {
    const res = await fetch(`${API_BASE}/notes/`, {
      headers: { token },
    });

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();
    setNotes(data);
  } catch (err) {
    console.log("Fetch error:", err);
  }
};


if (!token) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      <h2 className="text-2xl font-bold">Login</h2>

      <input
        placeholder="Email"
        className="p-2 border rounded text-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="p-2 border rounded text-black"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="px-6 py-2 bg-blue-500 text-white rounded"
        onClick={async () => {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (data.access_token) {
            localStorage.setItem("token", data.access_token);
            setToken(data.access_token);
          } else {
            alert("Login failed");
          }
        }}
      >
        Login
      </button>
    </div>
  );
}

  


  // ===============================
  // Create Note
  // ===============================
  const createNote = async () => {
    if (!note.trim()) return alert("Write something first!");

    await fetch(`${API_BASE}/notes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token,
      },
      body: JSON.stringify({ content: note }),
    });

    setNote("");
    fetchNotes();
  };

  // ===============================
  // Delete Note
  // ===============================
  const deleteNote = async (id) => {
    await fetch(`${API_BASE}/notes/${id}`, {
      method: "DELETE",
      headers: { token },
    });
    fetchNotes();
  };

  // ===============================
  // Clear All Notes
  // ===============================
  const clearAllNotes = async () => {
    await fetch(`${API_BASE}/notes/`, {
      method: "DELETE",
      headers: { token },
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
      headers: {
        "Content-Type": "application/json",
        token,
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setAnswer(data.answer);
  };

  // ===============================
  // Voice Recording
  // ===============================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current);
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        const res = await fetch(`${API_BASE}/notes/upload`, {
          method: "POST",
          body: formData,
          headers: { token },
        });

        const data = await res.json();
        setNote(data.transcription);

        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      alert("Mic access failed");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // ===============================
  // MAIN UI
  // ===============================
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">

        <div className="flex justify-between mb-4">
          <h1 className="text-3xl font-bold">🧠 AI Voice Notes</h1>

          <button
            className="bg-red-500 px-4 py-1 rounded"
            onClick={() => {
              localStorage.removeItem("token");
              setToken(null);
            }}
          >
            Logout
          </button>
        </div>

        {/* Create Note */}
        <textarea
          className="w-full p-3 rounded-xl bg-black/30 border text-white placeholder-gray-300"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button onClick={createNote} className="bg-purple-500 px-4 py-2 rounded">
          Save Note
        </button>

        {/* Voice */}
        <div className="my-4">
          {!recording ? (
            <button onClick={startRecording}>🎙 Start</button>
          ) : (
            <button onClick={stopRecording}>⏹ Stop</button>
          )}
        </div>

        {/* Notes */}
        <div>
          <button onClick={clearAllNotes} className="bg-red-600 px-3 py-1 rounded mb-2">
            Clear All
          </button>

          {notes.map((n) => (
            <div key={n.id} className="flex justify-between p-2 border mb-1">
              {n.content}
              <button onClick={() => deleteNote(n.id)}>❌</button>
            </div>
          ))}
        </div>

        {/* Ask */}
        <div className="mt-4">
          <input
            className="w-full p-2 border mb-2 bg-black/30 text-white"
            placeholder="Ask..."
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button onClick={askQuestion} className="bg-blue-500 px-4 py-2 rounded">
            Ask
          </button>

          {answer && <p className="mt-2">{answer}</p>}
        </div>

      </div>
    </div>
  );
}

export default App;