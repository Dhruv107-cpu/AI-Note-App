import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GROK_API_KEY = os.getenv("GROK_API_KEY")

GROK_URL = "https://api.x.ai/v1/chat/completions"

def ask_grok(question: str, context_notes: list[str]):

    context_text = "\n\n".join(
        [f"{i+1}. {note}" for i, note in enumerate(context_notes)]
    )

    prompt = f"""
You are a personal memory assistant.

Use ONLY the notes below to answer the question.

Notes:
{context_text}

Question:
{question}

Answer clearly and concisely.
"""

    headers = {
        "Authorization": f"Bearer {GROK_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "grok-4-1-fast-non-reasoning",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }

    response = httpx.post(GROK_URL, headers=headers, json=payload)

    result = response.json()

    return result["choices"][0]["message"]["content"]
