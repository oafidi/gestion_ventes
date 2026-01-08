import chromadb
from models.classes import Product, EmbeddingFunction
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from chromadb.utils.data_loaders import ImageLoader
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
import operator

data_loader = ImageLoader()
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
    result = dict_concatenate(result_text, result_images)
    return {"ids": list(result.keys())[:2]}

def get_top_products_by_image(url: str):
    try:
        result_images = collection_images.query(
            query_uris=[url],
            n_results=2
        )["ids"][0]
        return {"ids": result_images}
    except:
        return {"ids":[]}

if __name__=="__main__":
    product = Product(id=2, vendor_price=150, title="Crème", description="")
    print(add_or_update_product(product))
    print(get_top_products("skincare"))
