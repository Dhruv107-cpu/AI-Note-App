import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def ask_gemini(question, context):
    prompt = f"""
    You are an AI assistant.

    Answer ONLY from the given context.
    If answer is not present, say "Not found in notes".

    Context:
    {context}

    Question:
    {question}
    """

    response = model.generate_content(prompt)

    return response.text