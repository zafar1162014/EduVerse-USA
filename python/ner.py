# Named Entity Recognition for EduVerse USA Chatbot
# Extracts universities, programs, tests, scores, and deadlines from user queries

import re
from dataclasses import dataclass
from typing import Dict, List


@dataclass
class Entities:
    """Container for all extracted entities."""
    universities: List[str]
    programs: List[str]
    locations: List[str]
    tests: List[str]
    deadlines: List[str]
    scores: Dict[str, str]


# Known university names - we check if these appear in the text
UNIVERSITY_GAZETTEER = [
    "mit", "stanford", "harvard", "carnegie mellon",
    "uc berkeley", "university of southern california", "usc",
    "new york university", "nyu", "columbia", "cornell",
    "princeton", "yale", "ucla", "caltech",
]

US_STATE_ABBREVIATIONS = [
    "CA", "NY", "TX", "MA", "IL", "PA", "WA", "GA", "NC", "NJ",
]

# Regex patterns to match specific entity types
TEST_PATTERNS = [r"\bgre\b", r"\btoefl\b", r"\bielts\b", r"\bgmat\b"]

PROGRAM_PATTERNS = [
    r"\bms\s+in\s+[a-z\s]+",
    r"\bmaster'?s\s+in\s+[a-z\s]+",
    r"\bphd\s+in\s+[a-z\s]+",
    r"\bcomputer\s+science\b",
    r"\bdata\s+science\b",
    r"\bmachine\s+learning\b",
]

DEADLINE_PATTERNS = [
    r"\bfall\s+20\d{2}\b",
    r"\bspring\s+20\d{2}\b",
    r"\b(\w{3,9})\s+(\d{1,2})(st|nd|rd|th)?\b",
    r"\b\d{1,2}/\d{1,2}/20\d{2}\b",
]

# Patterns for extracting test scores and GPA
SCORE_PATTERNS = {
    "gpa": r"\bgpa\s*(?:is|:)?\s*(\d\.\d{1,2})\b",
    "toefl": r"\btoefl\s*(?:is|:)?\s*(\d{2,3})\b",
    "ielts": r"\bielts\s*(?:is|:)?\s*(\d(?:\.\d)?)\b",
    "gre": r"\bgre\s*(?:is|:)?\s*(\d{3})\b",
}


def extract_entities(text: str) -> Entities:
    """
    Extract all academic entities from user text.
    
    Uses gazetteer lookup for universities and regex for other entities.
    This is faster than ML-based NER and works well for our domain.
    """
    text_lower = text.lower()

    # Find university names
    universities = [u for u in UNIVERSITY_GAZETTEER if u in text_lower]

    # Find program mentions
    programs: List[str] = []
    for pattern in PROGRAM_PATTERNS:
        matches = re.finditer(pattern, text_lower)
        programs.extend(m.group(0).strip() for m in matches)

    # Find test names
    tests: List[str] = []
    for pattern in TEST_PATTERNS:
        matches = re.finditer(pattern, text_lower)
        tests.extend(m.group(0).upper() for m in matches)
    tests = sorted(set(tests))

    # Find US state mentions
    locations: List[str] = []
    for state in US_STATE_ABBREVIATIONS:
        if re.search(rf"\b{state.lower()}\b", text_lower):
            locations.append(state)

    # Find deadline mentions
    deadlines: List[str] = []
    for pattern in DEADLINE_PATTERNS:
        matches = re.finditer(pattern, text_lower)
        deadlines.extend(m.group(0).strip() for m in matches)

    # Find score values
    scores: Dict[str, str] = {}
    for score_type, pattern in SCORE_PATTERNS.items():
        match = re.search(pattern, text_lower)
        if match:
            scores[score_type] = match.group(1)

    return Entities(
        universities=list(set(universities)),
        programs=list(set(programs)),
        locations=locations,
        tests=tests,
        deadlines=deadlines,
        scores=scores,
    )


if __name__ == "__main__":
    sample = "I want MS in Computer Science at USC in CA for Fall 2026. GPA: 3.7 TOEFL 102."
    entities = extract_entities(sample)
    
    print("Named Entity Recognition Demo")
    print("=" * 60)
    print(f"Input: {sample}")
    print(f"\nExtracted Entities:")
    print(f"  Universities: {entities.universities}")
    print(f"  Programs: {entities.programs}")
    print(f"  Locations: {entities.locations}")
    print(f"  Tests: {entities.tests}")
    print(f"  Deadlines: {entities.deadlines}")
    print(f"  Scores: {entities.scores}")
