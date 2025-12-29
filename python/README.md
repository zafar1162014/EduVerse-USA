# EduVerse USA — Python NLP Pipeline

Standalone Python modules implementing the NLP pipeline for academic evaluation and documentation.

## Important Note

These Python scripts are designed for **external execution** in environments like Google Colab, Jupyter, or VS Code with Python extension. They serve as the reference implementation for the NLP techniques used in the chatbot.

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Pipeline Modules

| File | Purpose | Key Techniques |
|------|---------|----------------|
| `preprocessing.py` | Text cleaning | Tokenization, stopwords, lemmatization |
| `intent_classification.py` | Intent detection | TF-IDF, Logistic Regression |
| `ner.py` | Entity extraction | Regex patterns, gazetteers |
| `dialogue_state.py` | Context tracking | State management, entity merging |
| `rag.py` | Knowledge retrieval | Embeddings, cosine similarity |
| `response_generation.py` | Response composition | Templates, grounding |

## Usage Examples

Each module includes a demo in `if __name__ == "__main__":` block:

```bash
# Run preprocessing demo
python preprocessing.py

# Run intent classification with training
python intent_classification.py

# Run entity extraction
python ner.py

# Run dialogue state tracking
python dialogue_state.py

# Run RAG retrieval
python rag.py

# Run response generation
python response_generation.py
```

## Dependencies

Core requirements:
- numpy >= 1.26
- pandas >= 2.2
- scikit-learn >= 1.4
- nltk >= 3.8
- matplotlib >= 3.8 (for visualizations)

Optional for production:
- sentence-transformers (semantic embeddings)
- faiss-cpu (efficient similarity search)
- spacy (advanced NER)

## Testing

To verify all modules work correctly:

```bash
python -c "
from preprocessing import preprocess
from intent_classification import build_training_dataset, train_intent_model, predict_intent
from ner import extract_entities
from dialogue_state import DialogueState, merge_state
from rag import build_knowledge_base, retrieve
from response_generation import GenerationInputs, generate_response

print('All modules imported successfully')
"
```
