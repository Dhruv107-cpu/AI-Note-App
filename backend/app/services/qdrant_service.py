from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from qdrant_client.models import CollectionInfo

# Connect to local Qdrant
client = QdrantClient(host="localhost", port=6333)

COLLECTION_NAME = "voice_notes"

def create_collection():
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

def upsert_embedding(note_id: int, vector: list):
    print(f"Upserting embedding for note_id={note_id}")

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


def search_similar(vector: list, top_k: int = 3):
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        limit=top_k,
    )
    return results.points

