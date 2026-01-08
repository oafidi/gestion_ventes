from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.classes import Product, SearchQuery, CollabInput, ChatMessage, AnalyticsQuery
from semantic_search import get_top_products, add_or_update_product, get_top_products_by_image
from collaborative_filtering import recommendation_system
from customer_support import ask
from analytics_chat import process_analytics_query, generate_natural_response

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

# ==================== CUSTOMER SUPPORT ENDPOINT ====================

@app.post("/support/ask")
def ask_support(chat_message: ChatMessage):
    """
    Pose une question au support - cherche dans les FAQs ET les produits.
    
    Request body:
    - message: La question de l'utilisateur
    
    Response:
    - found: Si une réponse a été trouvée
    - answer: La réponse
    - confidence: Score de confiance (0-1)
    - source_type: "faq" ou "product"
    - sources: Liste des sources trouvées avec leur contenu
    """
    return ask(chat_message.message)

# ==================== ANALYTICS CHAT ENDPOINT ====================

@app.post("/analytics/chat")
def analytics_chat(analytics_query: AnalyticsQuery):
    """
    Analyse les données en langage naturel.
    Peut retourner un KPI ou des données pour un graphique.
    
    Request body:
    - query: La question de l'utilisateur en langage naturel
    
    Response:
    - type: "kpi" ou "chart" ou "error"
    - chart_type: "bar", "line", "pie", "donut" (si type=chart)
    - title: Titre de l'analyse
    - description: Description courte
    - data: Les données (format dépend du type)
    - message: Réponse en langage naturel
    - sql_query: La requête SQL exécutée
    """
    result = process_analytics_query(analytics_query.query)
    natural_response = generate_natural_response(result, analytics_query.query)
    result["message"] = natural_response
    return result
