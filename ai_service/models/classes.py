from pydantic import BaseModel
from typing import List, Dict, Optional

class Product(BaseModel):
    id: int
    vendor_price: float
    title: str
    description: str
    img_url: str

class EmbeddingFunction:
    def __init__(self, model):
        self.model = model

    def __call__(self, input):
        if isinstance(input, str):
            input = [input]
        return [self.model.encode(text).tolist() for text in input]
    
    def embed_query(self, input):
        if isinstance(input, str):
            input = [input]
        return [self.model.encode(text).tolist() for text in input]

    def name(self):
        return "sentence-transformers"

class SearchQuery(BaseModel):
    query:str

class CollabInput(BaseModel):
    collab_filtered_data: Dict[str, List]
    client_id: int
    k: Optional[int] = 3
