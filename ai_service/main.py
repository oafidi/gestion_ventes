from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.classes import Product, SearchQuery, CollabInput
from semantic_search import get_top_products, add_or_update_product, get_top_products_by_image
from collaborative_filtering import recommendation_system

app = FastAPI()

# Configuration CORS pour permettre les requêtes depuis le frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les origines autorisées
    allow_credentials=True,
    allow_methods=["*"],  # Autorise toutes les méthodes (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Autorise tous les headers
)

@app.post("/products/add_product", status_code=201)
def add_update_product(product: Product):
    return (add_or_update_product(product))

@app.post("/products/get_products_text")
def get_products_text(query: SearchQuery):
    return (get_top_products(query.query))

@app.post("/products/get_products_image")
def get_products_image(url: SearchQuery):
    return (get_top_products_by_image(url.query))

@app.post("/collaborative_filtering")
def get_similar_clients(collab_input : CollabInput):
    return {"similiar_clients_ids":recommendation_system(collab_input.collab_filtered_data, collab_input.client_id, collab_input.k)}
