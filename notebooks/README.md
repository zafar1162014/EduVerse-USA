# EduVerse USA — Jupyter Notebooks

Interactive notebooks demonstrating the complete NLP pipeline for academic evaluation and final year project documentation.

## Notebook Overview

| # | Notebook | Topic | Key Concepts |
|---|----------|-------|--------------|
| 1 | `01_preprocessing.ipynb` | Text Cleaning | Normalization, tokenization, stopwords, lemmatization |
| 2 | `02_intent_classification.ipynb` | Intent Detection | TF-IDF features, Logistic Regression, confidence scoring |
| 3 | `03_named_entity_recognition.ipynb` | Entity Extraction | Rule-based NER, spaCy, gazetteers, regex patterns |
| 4 | `04_context_management.ipynb` | Dialogue State | Multi-turn tracking, entity accumulation, state merging |
| 5 | `05_rag_retrieval.ipynb` | Knowledge Retrieval | Embeddings, FAISS indexing, semantic similarity |
| 6 | `06_response_generation.ipynb` | Response Generation | Template-based generation, fact grounding, hallucination prevention |

## Running the Notebooks

### Option 1: Google Colab (Recommended)

1. Go to [Google Colab](https://colab.research.google.com/)
2. Upload the notebook file
3. Run all cells (Runtime → Run all)
4. Dependencies install automatically via pip commands

### Option 2: Local Jupyter

```bash
# Install Jupyter and dependencies
pip install jupyter nltk pandas scikit-learn matplotlib seaborn spacy

# Download spaCy model (for NER notebook)
python -m spacy download en_core_web_sm

# Start Jupyter
jupyter notebook
```

### Option 3: VS Code

1. Install the Python and Jupyter extensions
2. Open any `.ipynb` file
3. Select Python interpreter
4. Run cells interactively

## What Each Notebook Demonstrates

### 01 — Text Preprocessing
- Raw text normalization (lowercase, URL/email removal)
- NLTK tokenization
- Stopword filtering
- Lemmatization for vocabulary reduction
- Token frequency visualization

### 02 — Intent Classification
- Training data preparation
- TF-IDF feature extraction
- Model training with Logistic Regression
- Evaluation metrics (precision, recall, F1)
- Confidence-based prediction

### 03 — Named Entity Recognition
- Gazetteer-based university detection
- Regex patterns for programs, tests, scores
- spaCy integration for additional entities
- Entity visualization

### 04 — Context Management
- Dialogue state data structure
- Entity accumulation across turns
- Intent tracking
- Context string generation

### 05 — RAG Retrieval
- Knowledge base construction
- Document embedding generation
- FAISS index for efficient search
- Top-k retrieval with similarity scores

### 06 — Response Generation
- Template-based response composition
- Fact grounding from retrieved passages
- Hallucination prevention strategies
- Intent-specific guidance

## Academic Requirements Covered

- Data Preprocessing & Text Cleaning
- Intent Classification with confidence scoring
- Named Entity Recognition (universities, programs, tests, scores)
- Context Management & Dialogue State Tracking
- Retrieval-Augmented Generation (RAG)
- Fact-grounded Response Generation
- Hallucination prevention techniques
- Clear visualizations and explanations
