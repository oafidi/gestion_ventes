import chromadb
from chromadb.config import Settings
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
from datasets import load_dataset
from typing import List, Optional
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
COLLECTION_NAME = "customer_support_faqs"
DB_PATH = "vector_store/"

# Initialisation OpenAI
openai_client = OpenAI()
embedding_fn = OpenAIEmbeddingFunction(
    api_key=os.getenv("OPENAI_API_KEY"),
    model_name="text-embedding-3-small"
)

client = chromadb.PersistentClient(path=DB_PATH)

# Collection FAQ
faq_collection = client.get_or_create_collection(
    name=COLLECTION_NAME,
    configuration={
        "hnsw": {
            "space": "cosine"
        }
    },
    embedding_function=embedding_fn
)

# Collection Produits (réutilise celle de semantic_search)
products_collection = client.get_or_create_collection(
    name="products_collection",
    configuration={
        "hnsw": {
            "space": "cosine"
        }
    },
    embedding_function=embedding_fn
)


def load_faq_dataset():
    """Charge le dataset FAQ et l'indexe dans ChromaDB"""
    if faq_collection.count() > 0:
        print(f"Collection déjà remplie avec {faq_collection.count()} FAQs")
        return {"status": "already_loaded", "count": faq_collection.count()}
    
    print("Chargement du dataset FAQ...")
    ds = load_dataset("MakTek/Customer_support_faqs_dataset")
    data = ds['train']
    
    documents = []
    ids = []
    metadatas = []
    
    for i, item in enumerate(data):
        doc_content = f"Question: {item['question']}\nAnswer: {item['answer']}"
        documents.append(doc_content)
        ids.append(f"faq_{i}")
        metadatas.append({
            "question": item['question'],
            "answer": item['answer'],
            "source": "faq"
        })
    
    batch_size = 100
    for i in range(0, len(documents), batch_size):
        end_idx = min(i + batch_size, len(documents))
        faq_collection.add(
            documents=documents[i:end_idx],
            ids=ids[i:end_idx],
            metadatas=metadatas[i:end_idx]
        )
        print(f"Ajouté {end_idx}/{len(documents)} FAQs")
    
    print(f"Dataset chargé avec succès: {len(documents)} FAQs")
    return {"status": "loaded", "count": len(documents)}


def search_all_sources(query: str, n_results: int = 3) -> List[dict]:
    """
    Recherche dans les FAQs ET dans les produits
    """
    results = []
    
    # Recherche dans les FAQs
    if faq_collection.count() > 0:
        faq_results = faq_collection.query(
            query_texts=[query],
            n_results=n_results
        )
        for i in range(len(faq_results['ids'][0])):
            results.append({
                "id": faq_results['ids'][0][i],
                "content": faq_results['documents'][0][i] if faq_results['documents'] else "",
                "metadata": faq_results['metadatas'][0][i],
                "distance": faq_results['distances'][0][i],
                "source": "faq"
            })
    
    # Recherche dans les produits
    if products_collection.count() > 0:
        product_results = products_collection.query(
            query_texts=[query],
            n_results=n_results
        )
        for i in range(len(product_results['ids'][0])):
            results.append({
                "id": product_results['ids'][0][i],
                "content": product_results['documents'][0][i] if product_results['documents'] else "",
                "metadata": product_results['metadatas'][0][i] if product_results['metadatas'] else {},
                "distance": product_results['distances'][0][i],
                "source": "product"
            })
    
    # Trier par distance (plus petit = plus pertinent)
    results.sort(key=lambda x: x['distance'])
    
    return results[:n_results]


def ask(query: str) -> dict:
    """
    Répond à une question en cherchant dans les FAQs et les produits,
    puis génère une réponse avec GPT
    
    Args:
        query: La question de l'utilisateur
    
    Returns:
        Réponse générée par GPT avec les sources
    """
    results = search_all_sources(query, n_results=3)
    
    if not results:
        return {
            "found": False,
            "answer": "Désolé, je n'ai pas trouvé d'information pertinente.",
            "sources": []
        }
    
    # Construire le contexte pour GPT
    context_parts = []
    for r in results:
        if r['source'] == 'faq':
            context_parts.append(f"FAQ - Question: {r['metadata'].get('question', '')}\nRéponse: {r['metadata'].get('answer', '')}")
        else:
            context_parts.append(f"Produit: {r['content']}")
    
    context = "\n\n".join(context_parts)
    
    # Générer la réponse avec GPT
    system_prompt = """Tu es un assistant de support client helpful et professionnel. 
Réponds aux questions en te basant UNIQUEMENT sur le contexte fourni.
Si le contexte ne contient pas l'information demandée, dis-le poliment.
Réponds de manière concise et claire."""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Contexte:\n{context}\n\nQuestion du client: {query}"}
            ],
            temperature=0.3,
            max_tokens=500
        )
        generated_answer = response.choices[0].message.content
    except Exception as e:
        print(f"Erreur OpenAI: {e}")
        # Fallback: retourner la meilleure correspondance directement
        best_result = results[0]
        if best_result['source'] == 'faq':
            generated_answer = best_result['metadata'].get('answer', best_result['content'])
        else:
            generated_answer = best_result['content']
    
    # Préparer les sources
    sources = []
    for r in results:
        source_info = {
            "id": r['id'],
            "source_type": r['source'],
            "confidence": round(max(0, 1 - r['distance']), 3)
        }
        if r['source'] == 'faq' and r['metadata']:
            source_info['question'] = r['metadata'].get('question', '')
            source_info['answer'] = r['metadata'].get('answer', '')
        else:
            source_info['content'] = r['content']
        sources.append(source_info)
    
    return {
        "found": True,
        "answer": generated_answer,
        "sources": sources
    }


if __name__ == "__main__":
    print(load_faq_dataset())
    
    test_query = "How can I pay?"
    print(f"\nRecherche: {test_query}")
    print(ask(test_query))

