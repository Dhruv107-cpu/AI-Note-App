import os
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from dotenv import load_dotenv

load_dotenv()

# Get from environment
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

# Connect to Qdrant Cloud
client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

COLLECTION_NAME = "voice_notes"


def create_collection():
    try:
        collections = client.get_collections().collections
        existing = [c.name for c in collections]

        if COLLECTION_NAME not in existing:
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=384,
                    distance=Distance.COSINE
                ),
            )
            print("Collection created.")
        else:
            print("Collection already exists.")

    except Exception as e:
        print("Qdrant connection error:", e)


def upsert_embedding(note_id: int, vector: list):
    try:
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                PointStruct(
                    id=note_id,
                    vector=vector,
                    payload={"note_id": note_id}
                )
            ],
        )
        print("Upsert completed.")

    except Exception as e:
        print("Upsert error:", e)


def search_similar(vector: list, top_k: int = 3):
    try:
        results = client.query_points(
            collection_name=COLLECTION_NAME,
            query=vector,
            limit=top_k,
        )
        return results.points

    except Exception as e:
        print("Search error:", e)
        return []