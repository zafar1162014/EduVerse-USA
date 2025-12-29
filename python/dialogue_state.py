# Dialogue State Tracking for EduVerse USA Chatbot
# Keeps track of the conversation context across multiple turns

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class DialogueState:
    """
    Tracks what we know about the user's needs across the conversation.
    
    This gets updated with each message so we don't lose context.
    For example, if they mention Stanford in turn 1 and ask about
    scholarships in turn 3, we remember they're asking about Stanford.
    """
    last_intent: Optional[str] = None
    universities: List[str] = field(default_factory=list)
    programs: List[str] = field(default_factory=list)
    locations: List[str] = field(default_factory=list)
    tests: List[str] = field(default_factory=list)
    deadlines: List[str] = field(default_factory=list)
    scores: Dict[str, str] = field(default_factory=dict)


def merge_state(state: DialogueState, intent: Optional[str], entities: Dict) -> DialogueState:
    """
    Update the state with new information from the current turn.
    
    New entities get added to existing ones (we don't overwrite).
    Scores get updated if the user gives new values.
    """
    if intent:
        state.last_intent = intent

    # Add new entities while keeping old ones (no duplicates)
    entity_fields = ["universities", "programs", "locations", "tests", "deadlines"]
    for field_name in entity_fields:
        incoming = entities.get(field_name, [])
        if incoming:
            current = getattr(state, field_name)
            merged = list(dict.fromkeys(current + list(incoming)))
            setattr(state, field_name, merged)

    # Update scores (new values replace old ones)
    incoming_scores = entities.get("scores", {})
    if incoming_scores:
        state.scores = {**state.scores, **incoming_scores}

    return state


def state_to_context_string(state: DialogueState) -> str:
    """
    Convert state to a readable string for debugging or logging.
    
    This helps us see what the chatbot "knows" at any point.
    """
    parts = []
    
    if state.last_intent:
        parts.append(f"intent={state.last_intent}")
    if state.universities:
        parts.append(f"universities={state.universities}")
    if state.programs:
        parts.append(f"programs={state.programs}")
    if state.locations:
        parts.append(f"locations={state.locations}")
    if state.tests:
        parts.append(f"tests={state.tests}")
    if state.deadlines:
        parts.append(f"deadlines={state.deadlines}")
    if state.scores:
        parts.append(f"scores={state.scores}")

    return " | ".join(parts) if parts else "(no context)"


if __name__ == "__main__":
    print("Dialogue State Tracking Demo")
    print("=" * 60)
    
    state = DialogueState()
    print(f"Initial: {state_to_context_string(state)}")
    
    # Simulate user asking about USC
    state = merge_state(
        state, 
        intent="admissions", 
        entities={
            "universities": ["usc"], 
            "locations": ["CA"], 
            "scores": {"gpa": "3.7"}
        }
    )
    print(f"\nAfter Turn 1: {state_to_context_string(state)}")
    
    # Simulate user asking about GRE
    state = merge_state(
        state,
        intent="test_prep",
        entities={
            "tests": ["GRE"],
            "deadlines": ["Fall 2026"]
        }
    )
    print(f"After Turn 2: {state_to_context_string(state)}")
