import chromadb
from models.classes import Product, EmbeddingFunction
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from chromadb.utils.data_loaders import ImageLoader
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
import operator
import requests
from io import BytesIO
from PIL import Image
import numpy as np
from typing import List, Optional
from chromadb.api.types import URI, URIs

class URLImageLoader(ImageLoader):
    """Custom ImageLoader qui supporte les URLs HTTP en plus des fichiers locaux"""
    
    def _load_image(self, uri: Optional[URI]) -> Optional[np.ndarray]:
        if uri is None:
            return None
        
        try:
            # Si c'est une URL HTTP/HTTPS, télécharger l'image
            if uri.startswith(('http://', 'https://')):
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
                response = requests.get(uri, timeout=10, headers=headers)
                response.raise_for_status()
                img = Image.open(BytesIO(response.content))
                # Convertir en RGB si nécessaire (pour les images RGBA ou palette)
                if img.mode in ('RGBA', 'P', 'LA'):
                    img = img.convert('RGB')
                return np.array(img)
            else:
                # Sinon, utiliser le comportement par défaut (fichier local)
                img = Image.open(uri)
                if img.mode in ('RGBA', 'P', 'LA'):
                    img = img.convert('RGB')
                return np.array(img)
        except Exception as e:
            print(f"Erreur lors du chargement de l'image {uri}: {e}")
            return None

data_loader = URLImageLoader()
embedding_img_function = OpenCLIPEmbeddingFunction()
embedding_model = SentenceTransformer("all-mpnet-base-v2") 
embedding_fn = EmbeddingFunction(embedding_model)
db_path = "vector_store/"
client = chromadb.PersistentClient(path=db_path)
collection = client.get_or_create_collection(
    name="products_collection",
    configuration={
        "hnsw": {
            "space": "cosine"
        }
    },
    embedding_function=embedding_fn
)
collection_images = client.get_or_create_collection(
    name="products_images_collection",
    configuration={
        "hnsw": {
            "space": "cosine"
        }
    },
    embedding_function=embedding_img_function,
    data_loader=data_loader
)

def add_or_update_product(product: Product):
    info = (
        "title: " + product.title +
        " | description: " + product.description +
        " | price: " + str(product.vendor_price)
    )

    collection.upsert(
        documents=[info],
        ids=[str(product.id)]
    )
    try:
        collection_images.delete(ids=[str(product.id)])
    except:
        pass
    try:
        collection_images.add(
            uris=[product.img_url],
            ids=[str(product.id)]
        )
        print("Image added/updated for product ID:", product.id)
        print("uri:", product.img_url)
    except:
        print("Error to open images")
        pass
    return {"product": product}

def dict_concatenate(result_text, result_images):
    result = {}
    for i in range(len(result_text["ids"][0])):
        result[result_text["ids"][0][i]] = result_text["distances"][0][i]
    for i in range(len(result_images["ids"][0])):
        if result_images["ids"][0][i] in result.keys():
            result[result_images["ids"][0][i]] = min(result_images["distances"][0][i], result[result_images["ids"][0][i]])
        else:
            result[result_images["ids"][0][i]] = result_images["distances"][0][i]
    result = dict(sorted(result.items(), key=operator.itemgetter(1)))
    return (result)

def get_top_products(query: str):
    result_text = collection.query(
        query_texts=[query],
        n_results=2
    )
    result_images = collection_images.query(
        query_texts=[query],
        n_results=2
    )
    print(result_images)
    result = dict_concatenate(result_text, result_images)
    return {"ids": list(result.keys())[:2]}

def get_top_products_by_image(url: str):
    try:
        print("=== DEBUG: Recherche par image ===")
        print("URL reçue:", url)
        
        # Vérifier le contenu de la collection
        collection_data = collection_images.get()
        print("Nombre de produits dans la collection images:", len(collection_data['ids']))
        
        if len(collection_data['ids']) == 0:
            print("ERREUR: La collection d'images est vide!")
            return {"ids": [], "error": "Collection d'images vide"}
        
        result_images = collection_images.query(
            query_uris=[url],
            n_results=2
        )
        print("Résultats de la recherche:", result_images)
        return {"ids": result_images["ids"][0]}
    except ValueError as e:
        if "non-empty" in str(e):
            print(f"ERREUR: Impossible de télécharger ou traiter l'image depuis l'URL")
            return {"ids": [], "error": "Impossible de charger l'image depuis l'URL fournie"}
        raise
    except Exception as e:
        print(f"ERREUR lors de la recherche par image: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return {"ids": [], "error": str(e)}

if __name__=="__main__":
    product = Product(id=2, vendor_price=150, title="Crème", description="")
    print(add_or_update_product(product))
    print(get_top_products("skincare"))
