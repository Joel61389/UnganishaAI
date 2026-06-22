import os
import numpy as np
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Fixed vocabulary of 128 keywords for local semantic embedding fallback
VOCABULARY = [
    # Roles & Ecosystem
    "founder", "co-founder", "cofounder", "cto", "ceo", "developer", "engineer", "coder", "programmer", "tech",
    "mentor", "guide", "coach", "advisor", "investor", "angel", "vc", "venture", "startup", "kenya", "nairobi",
    
    # Frontend & Design
    "react", "reactjs", "react.js", "nextjs", "next.js", "vue", "angular", "frontend", "front-end", "ui", "ux",
    "design", "figma", "tailwind", "css", "html", "javascript", "js", "typescript", "ts",
    
    # Backend & Data
    "python", "django", "flask", "fastapi", "node", "nodejs", "express", "go", "golang", "java", "spring",
    "postgresql", "postgres", "mysql", "sqlite", "mongodb", "database", "sql", "nosql",
    
    # AI & Emerging Tech
    "ai", "artificial", "intelligence", "ml", "machine", "learning", "nlp", "llm", "openai", "gpt", "rag",
    "agent", "deep", "neural", "computer", "vision", "web3", "crypto", "blockchain", "solana", "ethereum",
    
    # Industries
    "fintech", "finance", "payment", "bank", "agritech", "agriculture", "farming", "crop", "edtech", "education",
    "learning", "school", "climate", "sustainability", "energy", "solar", "green", "healthtech", "health",
    "medical", "e-commerce", "ecommerce", "shop", "logistics", "delivery",
    
    # Goals & Challenges
    "funding", "raise", "capital", "seed", "pre-seed", "round", "partnership", "collaborate", "networking",
    "experience", "opportunity", "hire", "recruit", "team", "growth", "marketing", "sales", "customer",
    "product", "strategy", "roadmap", "pmf", "mvp", "validation", "legal", "compliance", "ops"
]

def get_openai_embedding(text: str, client: OpenAI) -> list:
    """
    Generate embedding using OpenAI text-embedding-3-small.
    """
    try:
        response = client.embeddings.create(
            input=[text.replace("\n", " ")],
            model="text-embedding-3-small"
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"OpenAI embedding generation failed: {e}. Falling back to local embedding.")
        return None

def get_local_embedding(text: str) -> list:
    """
    Generate a 128-dimensional normalized term-frequency vector based on our VOCABULARY.
    If no vocabulary terms are matched, hashes words to create a dense deterministic vector.
    """
    text_lower = text.lower()
    vector = np.zeros(len(VOCABULARY))
    
    # Find matching keywords
    matched_any = False
    for i, word in enumerate(VOCABULARY):
        # Scan with word boundaries
        pattern = r'\b' + re.escape(word) + r'\b'
        matches = len(re.findall(pattern, text_lower))
        if matches > 0:
            vector[i] = matches
            matched_any = True
            
    # If no keywords matched, use simple hashing fallback to avoid zero vectors
    if not matched_any:
        words = [w for w in re.findall(r'\b\w+\b', text_lower) if len(w) > 2]
        if words:
            for word in words:
                idx = abs(hash(word)) % len(VOCABULARY)
                vector[idx] += 1
        else:
            vector[0] = 1.0 # default non-zero vector

    # Normalize vector to unit length
    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = vector / norm
        
    return vector.tolist()

import re # Import re for use in local embedding

def get_embedding(text: str) -> list:
    """
    Main entry point. Tries OpenAI first, then falls back to local.
    """
    if not text:
        return [0.0] * len(VOCABULARY)
        
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        client = OpenAI(api_key=api_key)
        emb = get_openai_embedding(text, client)
        if emb:
            return emb
            
    return get_local_embedding(text)

def cosine_similarity(v1: list, v2: list) -> float:
    """
    Calculates the cosine similarity between two vectors.
    """
    arr1 = np.array(v1)
    arr2 = np.array(v2)
    
    # Avoid divisions by zero
    norm1 = np.linalg.norm(arr1)
    norm2 = np.linalg.norm(arr2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
        
    return float(np.dot(arr1, arr2) / (norm1 * norm2))
