from sentence_transformers import SentenceTransformer

# Load model once
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def generate_embedding(text: str):
    return embedding_model.encode(text).tolist()
