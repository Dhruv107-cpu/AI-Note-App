import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

def ask_gemini(question, context):
    context_text = "\n".join(context)

    prompt = f"""
You are an intelligent AI assistant.

Instructions:
- Use the context to answer
- Explain clearly, not just extract
- Answer in 1–3 complete sentences
- Make it informative and natural
- If context is insufficient, say: "Not enough information in notes"
-Always respond in 1–3 well-formed sentences.

Context:
{context_text}

Question:
{question}

Answer:
"""

    response = model.generate_content(prompt)
    return response.text