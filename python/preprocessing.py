# Text Preprocessing for EduVerse USA Chatbot
# Cleans raw user queries before feeding them to the NLP pipeline

import re
from dataclasses import dataclass
from typing import List

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize


@dataclass
class PreprocessConfig:
    """Settings for text preprocessing - toggle each step on/off."""
    lowercase: bool = True
    remove_urls: bool = True
    remove_emails: bool = True
    remove_special_chars: bool = True
    collapse_whitespace: bool = True
    remove_stopwords: bool = True
    language: str = "english"


def ensure_nltk_resources():
    """Download NLTK data if not already present."""
    resources = ["punkt", "stopwords", "wordnet", "omw-1.4"]
    for resource in resources:
        nltk.download(resource, quiet=True)


def normalize_text(text: str, config: PreprocessConfig) -> str:
    """
    Clean raw text by removing noise.
    
    Handles URLs, emails, special characters, and extra whitespace.
    We keep periods and commas because they help identify scores like "3.8".
    """
    result = text.strip()

    if config.lowercase:
        result = result.lower()

    if config.remove_urls:
        result = re.sub(r"https?://\S+|www\.\S+", " ", result)

    if config.remove_emails:
        result = re.sub(r"\b[\w\.-]+@[\w\.-]+\.\w+\b", " ", result)

    if config.remove_special_chars:
        result = re.sub(r"[^a-z0-9\s\.,\+\-]", " ", result)

    if config.collapse_whitespace:
        result = re.sub(r"\s+", " ", result).strip()

    return result


def preprocess(text: str, config: PreprocessConfig | None = None) -> List[str]:
    """
    Full preprocessing pipeline.
    
    Steps: normalize -> tokenize -> remove stopwords -> lemmatize
    Returns a list of clean tokens ready for further processing.
    """
    config = config or PreprocessConfig()
    ensure_nltk_resources()

    # Clean the text
    normalized = normalize_text(text, config)
    
    # Split into words
    tokens = word_tokenize(normalized)

    # Remove common words that don't carry meaning
    if config.remove_stopwords:
        stop_words = set(stopwords.words(config.language))
        tokens = [t for t in tokens if t not in stop_words]

    # Reduce words to their base form (e.g., "universities" -> "university")
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(t) for t in tokens]

    # Remove single-character noise but keep numbers
    tokens = [t for t in tokens if len(t) > 1 or t.isdigit()]

    return tokens


if __name__ == "__main__":
    sample = "I want to apply to MS in CS at USC; my GPA is 3.7 and TOEFL 102. Any scholarships?"
    
    print("Text Preprocessing Demo")
    print("=" * 60)
    print(f"Input:  {sample}")
    print(f"Output: {preprocess(sample)}")
