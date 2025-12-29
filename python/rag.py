# Retrieval-Augmented Generation for EduVerse USA Chatbot
# Finds relevant knowledge to ground the chatbot's responses in facts

from dataclasses import dataclass
from typing import Callable, List, Tuple

import numpy as np


@dataclass
class Document:
    """A piece of knowledge in our database."""
    doc_id: str
    text: str
    metadata: dict


def default_embed(texts: List[str]) -> np.ndarray:
    """
    Simple hash-based embedding for testing.
    
    In production, you'd use something like SentenceTransformers here.
    This just gives us consistent vectors for demo purposes.
    """
    dim = 64
    vectors = []
    
    for text in texts:
        vec = np.zeros(dim, dtype=np.float32)
        for char in text.lower():
            vec[ord(char) % dim] += 1.0
        norm = np.linalg.norm(vec) + 1e-8
        vectors.append(vec / norm)
    
    return np.vstack(vectors)


def build_knowledge_base() -> List[Document]:
    """
    Create our knowledge base with U.S. education facts.
    
    These are the "ground truth" passages the chatbot uses
    to give accurate information instead of making things up.
    """
    return [
        Document(
            doc_id="admissions_basics",
            text="U.S. graduate admissions require transcripts, SOP, "
                 "letters of recommendation, test scores, and a resume.",
            metadata={"topic": "admissions"},
        ),
        Document(
            doc_id="sop_structure",
            text="A strong SOP covers motivation, academic background, "
                 "research experience, program fit, and career goals.",
            metadata={"topic": "sop"},
        ),
        Document(
            doc_id="funding_options",
            text="Funding options include merit scholarships, assistantships "
                 "(TA/RA), and external fellowships like Fulbright.",
            metadata={"topic": "scholarships"},
        ),
        Document(
            doc_id="gre_overview",
            text="The GRE has Verbal (130-170), Quantitative (130-170), and "
                 "Analytical Writing (0-6) sections. Target 315+ for MS.",
            metadata={"topic": "test_prep"},
        ),
        Document(
            doc_id="toefl_requirements",
            text="TOEFL iBT scores range 0-120. Most universities require "
                 "80-100; top programs expect 100+.",
            metadata={"topic": "test_prep"},
        ),
    ]


def retrieve(
    query: str,
    documents: List[Document],
    embed_fn: Callable[[List[str]], np.ndarray] = default_embed,
    top_k: int = 3,
) -> List[Tuple[Document, float]]:
    """
    Find the most relevant documents for a user query.
    
    Uses cosine similarity between query and document embeddings.
    Returns documents sorted by relevance with their scores.
    """
    doc_texts = [doc.text for doc in documents]
    doc_embeddings = embed_fn(doc_texts)
    
    query_embedding = embed_fn([query])[0]
    
    # Cosine similarity (embeddings are normalized)
    similarities = (doc_embeddings @ query_embedding).tolist()
    
    scored_docs = list(zip(documents, similarities))
    scored_docs.sort(key=lambda x: x[1], reverse=True)
    
    return scored_docs[:top_k]


if __name__ == "__main__":
    print("RAG Retrieval Demo")
    print("=" * 60)
    
    kb = build_knowledge_base()
    print(f"Knowledge base size: {len(kb)} documents")
    
    query = "How do I write a strong SOP for MS?"
    results = retrieve(query, kb)
    
    print(f"\nQuery: {query}")
    print("\nTop 3 Results:")
    for doc, score in results:
        print(f"  [{score:.3f}] {doc.doc_id}: {doc.text[:60]}...")
