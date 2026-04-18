import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

def ask_gemini(question, notes):
    try:
        context = "\n".join(notes)

        prompt = f"""
        Answer the question using the notes below.

        Notes:
        {context}

        Question:
        {question}
        """

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        print("Gemini Error:", e)

        # 🔥 FALLBACK (VERY IMPORTANT)
        return notes[0] if notes else "No relevant notes found."