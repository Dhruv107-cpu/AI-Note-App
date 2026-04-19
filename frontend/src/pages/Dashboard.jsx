import { useEffect, useState } from "react";

export default function Dashboard({ token }) {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const fetchNotes = async () => {
    const res = await fetch("http://127.0.0.1:8000/notes/", {
      headers: { token },
    });
    const data = await res.json();
    setNotes(data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async () => {
    await fetch("http://127.0.0.1:8000/notes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token,
      },
      body: JSON.stringify({ content }),
    });

    setContent("");
    fetchNotes();
  };

  const ask = async () => {
    const res = await fetch("http://127.0.0.1:8000/notes/ask", {
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

  return (
    <div>
      <h2>Dashboard</h2>

      <h3>Add Note</h3>
      <input value={content} onChange={(e) => setContent(e.target.value)} />
      <button onClick={addNote}>Add</button>

      <h3>Notes</h3>
      {notes.map((n) => (
        <p key={n.id}>{n.content}</p>
      ))}

      <h3>Ask Question</h3>
      <input onChange={(e) => setQuestion(e.target.value)} />
      <button onClick={ask}>Ask</button>

      <p><b>Answer:</b> {answer}</p>
    </div>
  );
}