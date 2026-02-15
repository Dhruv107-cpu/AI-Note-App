from faster_whisper import WhisperModel

# Load model once (global)
model = WhisperModel("base", device="cpu")

def transcribe_audio(file_path: str) -> str:
    segments, info = model.transcribe(file_path)
    
    full_text = ""
    for segment in segments:
        full_text += segment.text + " "
    
    return full_text.strip()
