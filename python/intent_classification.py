# Intent Classification for EduVerse USA Chatbot
# Classifies user queries into categories: admissions, sop, scholarships, test_prep

from dataclasses import dataclass
from typing import Dict, List, Tuple

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split


INTENTS = ["admissions", "sop", "scholarships", "test_prep"]


@dataclass
class IntentPrediction:
    """Result of classifying a user query."""
    intent: str
    confidence: float
    probabilities: Dict[str, float]


def build_training_dataset() -> Tuple[List[str], List[str]]:
    """
    Sample training data for intent classification.
    In production, this would come from a larger labeled dataset.
    """
    texts = [
        # Admissions examples
        "What documents are required for MS admissions in the USA?",
        "Application deadline for fall intake and LOR requirements",
        # SOP examples
        "How do I write a strong statement of purpose for computer science?",
        "Can you review my SOP draft and suggest improvements?",
        # Scholarship examples
        "Any scholarships for international students in the US?",
        "Assistantships and funding options for MS students",
        # Test prep examples
        "GRE 315 plan in 6 weeks and TOEFL tips",
        "IELTS 7.0 study strategy and practice resources",
    ]
    
    labels = [
        "admissions", "admissions",
        "sop", "sop",
        "scholarships", "scholarships",
        "test_prep", "test_prep",
    ]
    
    return texts, labels


def train_intent_model(texts: List[str], labels: List[str]) -> Tuple[LogisticRegression, TfidfVectorizer]:
    """
    Train a classifier using TF-IDF features.
    
    TF-IDF captures important words in each query.
    Logistic Regression gives us probability scores for each intent.
    """
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.25, random_state=42, stratify=labels
    )

    # Convert text to numerical features
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),  # Use both single words and word pairs
        min_df=1,
        max_features=5000,
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Train the model
    model = LogisticRegression(max_iter=200)
    model.fit(X_train_vec, y_train)

    # Show how well it works
    y_pred = model.predict(X_test_vec)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred, labels=INTENTS))

    return model, vectorizer


def predict_intent(model: LogisticRegression, vectorizer: TfidfVectorizer, text: str) -> IntentPrediction:
    """
    Predict intent with confidence score.
    
    The confidence tells us how sure the model is - low confidence
    means we might need to ask the user to clarify.
    """
    vec = vectorizer.transform([text])
    probabilities = model.predict_proba(vec)[0]
    classes = model.classes_

    prob_map = {cls: float(p) for cls, p in zip(classes, probabilities)}
    best_idx = int(np.argmax(probabilities))

    return IntentPrediction(
        intent=str(classes[best_idx]),
        confidence=float(probabilities[best_idx]),
        probabilities=prob_map,
    )


if __name__ == "__main__":
    texts, labels = build_training_dataset()
    model, vectorizer = train_intent_model(texts, labels)

    sample = "I need scholarship options and assistantships for MS in data science"
    prediction = predict_intent(model, vectorizer, sample)

    print("\nIntent Prediction Demo")
    print("=" * 60)
    print(f"Input: {sample}")
    print(f"Intent: {prediction.intent}")
    print(f"Confidence: {prediction.confidence:.2%}")
    print(f"All Probabilities: {prediction.probabilities}")
