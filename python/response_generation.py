# Response Generation for EduVerse USA Chatbot
# Creates fact-grounded responses using intent, entities, and retrieved passages

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class GenerationInputs:
    """Everything we need to generate a response."""
    intent: str
    entities: Dict
    retrieved_passages: List[str]
    user_question: str
    dialogue_context: Optional[str] = None


# Rules to prevent the chatbot from making up information
HALLUCINATION_GUARDRAILS = [
    "Only state facts supported by retrieved passages or widely-known requirements.",
    "For specific deadlines or fees, recommend checking the official program website.",
    "If information is missing, ask a clarifying question rather than guessing.",
    "Use hedging language ('typically', 'generally') for uncertain information.",
]


# Helpful tips based on what the user is asking about
INTENT_GUIDANCE = {
    "admissions": (
        "Share your target degree (MS/PhD), major, and intake term "
        "(Fall/Spring) to refine requirements."
    ),
    "sop": (
        "If you paste your SOP draft, I can suggest structure improvements "
        "and stronger evidence of fit."
    ),
    "scholarships": (
        "Funding varies by university and program; consider merit scholarships, "
        "TA/RA positions, and external fellowships."
    ),
    "test_prep": (
        "Share your current scores and timeline; I can suggest a study plan "
        "and practice resources."
    ),
}


def generate_response(inputs: GenerationInputs) -> str:
    """
    Generate a response that's grounded in facts.
    
    We use the retrieved passages as our source of truth and add
    intent-specific guidance. Always reminds users to verify details.
    """
    lines: List[str] = []

    lines.append(f"**Intent detected:** {inputs.intent}")

    if inputs.dialogue_context:
        lines.append(f"**Context:** {inputs.dialogue_context}")

    if inputs.retrieved_passages:
        lines.append("\n**Relevant Information:**")
        for passage in inputs.retrieved_passages[:3]:
            lines.append(f"• {passage}")

    lines.append("\n**Guidance:**")
    guidance = INTENT_GUIDANCE.get(
        inputs.intent, 
        "Please clarify whether you need help with admissions, SOP, "
        "scholarships, or test preparation."
    )
    lines.append(f"• {guidance}")

    lines.append("\n**Note:**")
    lines.append(
        "• For official deadlines and fee amounts, always verify on the "
        "university/program website."
    )

    return "\n".join(lines)


if __name__ == "__main__":
    print("Response Generation Demo")
    print("=" * 60)
    
    demo_inputs = GenerationInputs(
        intent="sop",
        entities={"universities": ["usc"], "programs": ["ms in computer science"]},
        retrieved_passages=[
            "A strong SOP covers motivation, academic background, "
            "research experience, fit with the program, and career goals."
        ],
        user_question="How should I structure my SOP?",
        dialogue_context="intent=sop | universities=['usc']",
    )
    
    response = generate_response(demo_inputs)
    print(response)
