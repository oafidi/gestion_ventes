"""
Analytics Chat Service - Service d'analyse de données par langage naturel
Utilise LangChain et OpenAI pour interpréter les requêtes et générer des KPIs/graphiques
"""

import os
import json
import mysql.connector
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, SystemMessage
from pydantic import BaseModel

load_dotenv()

# Configuration de la base de données
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'affiliate_sales_db')
}

# Initialisation du modèle LLM
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    api_key=os.getenv("OPENAI_API_KEY")
)

# Schéma de la base de données pour le contexte
DB_SCHEMA = """
Tables disponibles dans la base de données:

1. categories (id, nom, description, image)
2. produits (id, nom, description, prix, categorie_id, image)
3. vendeurs (id, nom, email, telephone, est_approuve) - hérite de utilisateurs
4. clients (id, nom, email, telephone, adresse_livraison) - hérite de utilisateurs
5. vendeur_produits (id, vendeur_id, produit_id, prix_vendeur, titre, description, image, est_approuve)
6. commandes (id, client_id, date_commande, statut, total, adresse_livraison)
7. lignes_commande (id, commande_id, vendeur_produit_id, quantite, prix_unitaire, sous_total)
8. avis (id, client_id, vendeur_produit_id, note, commentaire, date_avis)

Relations:
- produits.categorie_id -> categories.id
- vendeur_produits.vendeur_id -> vendeurs.id
- vendeur_produits.produit_id -> produits.id
- commandes.client_id -> clients.id
- lignes_commande.commande_id -> commandes.id
- lignes_commande.vendeur_produit_id -> vendeur_produits.id
- avis.vendeur_produit_id -> vendeur_produits.id
"""

# Types de réponses possibles
class AnalyticsResponse(BaseModel):
    type: str  # "kpi" ou "chart"
    title: str
    description: str
    data: Any
    chart_type: Optional[str] = None  # "bar", "line", "pie", "donut"
    sql_query: Optional[str] = None

def get_db_connection():
    """Crée une connexion à la base de données"""
    return mysql.connector.connect(**DB_CONFIG)

def execute_query(query: str) -> List[Dict]:
    """Exécute une requête SQL et retourne les résultats"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"Erreur SQL: {e}")
        return []

def classify_request(user_message: str) -> Dict:
    """
    Classifie la requête de l'utilisateur pour déterminer:
    - S'il veut un KPI ou un graphique
    - Le type de graphique si applicable
    - La requête SQL à exécuter
    """
    
    system_prompt = f"""Tu es un assistant d'analyse de données expert. Tu dois analyser la demande de l'utilisateur et déterminer:

1. Si l'utilisateur veut un KPI (une valeur simple comme un total, une moyenne, un nombre) ou un graphique
2. Si c'est un graphique, quel type: "bar" (barres), "line" (lignes), "pie" (camembert), "donut" (anneau)
3. La requête SQL à exécuter pour obtenir les données

{DB_SCHEMA}

IMPORTANT:
- Pour les KPIs, retourne une seule valeur ou quelques valeurs clés
- Pour les graphiques, retourne des données avec des labels et des valeurs
- Utilise toujours des alias clairs pour les colonnes (label, value, etc.)
- Les montants sont en DH (Dirhams)

Réponds UNIQUEMENT avec un JSON valide au format suivant:
{{
    "type": "kpi" ou "chart",
    "chart_type": "bar" | "line" | "pie" | "donut" | null,
    "title": "Titre descriptif",
    "description": "Description courte de ce que montre l'analyse",
    "sql_query": "SELECT ..."
}}

Exemples de requêtes:
- "combien de commandes" -> KPI avec COUNT
- "chiffre d'affaires total" -> KPI avec SUM
- "ventes par catégorie" -> graphique pie ou bar
- "évolution des ventes par mois" -> graphique line
- "top 5 produits" -> graphique bar
- "répartition des vendeurs" -> graphique donut
"""

    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_message)
        ])
        
        # Parser la réponse JSON
        content = response.content.strip()
        # Nettoyer le JSON si nécessaire
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        return json.loads(content.strip())
    except Exception as e:
        print(f"Erreur classification: {e}")
        return None

def format_kpi_response(results: List[Dict], classification: Dict) -> Dict:
    """Formate la réponse pour un KPI"""
    if not results:
        return {
            "type": "kpi",
            "title": classification.get("title", "KPI"),
            "description": classification.get("description", ""),
            "data": {"value": 0, "label": "Aucune donnée"},
            "sql_query": classification.get("sql_query", "")
        }
    
    # Si un seul résultat avec une seule colonne
    if len(results) == 1:
        row = results[0]
        if len(row) == 1:
            key = list(row.keys())[0]
            value = row[key]
            # Formatter les nombres
            if isinstance(value, (int, float)):
                if value >= 1000000:
                    formatted = f"{value/1000000:.2f}M"
                elif value >= 1000:
                    formatted = f"{value/1000:.1f}K"
                else:
                    formatted = f"{value:,.2f}" if isinstance(value, float) else f"{value:,}"
            else:
                formatted = str(value)
            
            return {
                "type": "kpi",
                "title": classification.get("title", "KPI"),
                "description": classification.get("description", ""),
                "data": {"value": value, "formatted": formatted, "label": key},
                "sql_query": classification.get("sql_query", "")
            }
        else:
            # Plusieurs colonnes
            return {
                "type": "kpi",
                "title": classification.get("title", "KPI"),
                "description": classification.get("description", ""),
                "data": row,
                "sql_query": classification.get("sql_query", "")
            }
    else:
        # Plusieurs lignes - retourner comme liste
        return {
            "type": "kpi",
            "title": classification.get("title", "KPI"),
            "description": classification.get("description", ""),
            "data": {"items": results},
            "sql_query": classification.get("sql_query", "")
        }

def format_chart_response(results: List[Dict], classification: Dict) -> Dict:
    """Formate la réponse pour un graphique"""
    if not results:
        return {
            "type": "chart",
            "chart_type": classification.get("chart_type", "bar"),
            "title": classification.get("title", "Graphique"),
            "description": classification.get("description", ""),
            "data": {"labels": [], "values": []},
            "sql_query": classification.get("sql_query", "")
        }
    
    # Extraire les labels et valeurs
    keys = list(results[0].keys())
    
    # Supposer que la première colonne est le label et la deuxième la valeur
    label_key = keys[0] if keys else "label"
    value_key = keys[1] if len(keys) > 1 else keys[0]
    
    labels = [str(row.get(label_key, "")) for row in results]
    values = [float(row.get(value_key, 0)) if row.get(value_key) else 0 for row in results]
    
    # Pour les graphiques avec plusieurs séries
    datasets = []
    if len(keys) > 2:
        for key in keys[1:]:
            datasets.append({
                "label": key,
                "data": [float(row.get(key, 0)) if row.get(key) else 0 for row in results]
            })
    else:
        datasets = [{"label": value_key, "data": values}]
    
    return {
        "type": "chart",
        "chart_type": classification.get("chart_type", "bar"),
        "title": classification.get("title", "Graphique"),
        "description": classification.get("description", ""),
        "data": {
            "labels": labels,
            "values": values,
            "datasets": datasets
        },
        "sql_query": classification.get("sql_query", "")
    }

def process_analytics_query(user_message: str) -> Dict:
    """
    Traite une requête d'analyse en langage naturel.
    
    Args:
        user_message: La question de l'utilisateur en langage naturel
    
    Returns:
        Dict avec le type (kpi/chart), les données et les métadonnées
    """
    
    # Classifier la requête
    classification = classify_request(user_message)
    
    if not classification:
        return {
            "type": "error",
            "title": "Erreur",
            "description": "Impossible de comprendre votre demande. Essayez de reformuler.",
            "data": None
        }
    
    # Exécuter la requête SQL
    sql_query = classification.get("sql_query", "")
    if not sql_query:
        return {
            "type": "error",
            "title": "Erreur",
            "description": "Impossible de générer la requête SQL.",
            "data": None
        }
    
    results = execute_query(sql_query)
    
    # Formater la réponse selon le type
    if classification.get("type") == "kpi":
        return format_kpi_response(results, classification)
    else:
        return format_chart_response(results, classification)

def generate_natural_response(result: Dict, user_message: str) -> str:
    """Génère une réponse en langage naturel basée sur les résultats"""
    
    if result.get("type") == "error":
        return result.get("description", "Une erreur s'est produite.")
    
    system_prompt = """Tu es un assistant d'analyse de données. 
    Génère une réponse courte et naturelle en français basée sur les résultats de l'analyse.
    Sois concis mais informatif. Utilise des chiffres formattés (ex: 1,234.56 DH).
    """
    
    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Question: {user_message}\n\nRésultats: {json.dumps(result, ensure_ascii=False)}")
        ])
        return response.content
    except:
        if result.get("type") == "kpi":
            data = result.get("data", {})
            if isinstance(data, dict) and "formatted" in data:
                return f"{result.get('title', 'Résultat')}: {data['formatted']}"
            return f"{result.get('title', 'Résultat')}: {json.dumps(data)}"
        else:
            return f"Voici le graphique '{result.get('title', '')}' avec les données demandées."


# Tests
if __name__ == "__main__":
    # Test KPI
    print("\n=== Test KPI ===")
    result = process_analytics_query("Quel est le chiffre d'affaires total?")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print("\nRéponse:", generate_natural_response(result, "Quel est le chiffre d'affaires total?"))
    
    # Test Graphique
    print("\n=== Test Graphique ===")
    result = process_analytics_query("Montre moi les ventes par catégorie en camembert")
    print(json.dumps(result, indent=2, ensure_ascii=False))
