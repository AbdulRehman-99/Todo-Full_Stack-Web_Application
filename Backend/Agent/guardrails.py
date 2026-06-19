import re
from enum import Enum


class GuardrailResult(Enum):
    GREETING = "greeting"
    TASK = "task"
    OFF_TOPIC = "off_topic"


GREETING_PATTERNS = [
    re.compile(r"^(hi|hello|hey|greetings|howdy|yo|sup)\b", re.IGNORECASE),
    re.compile(r"^good\s*(morning|afternoon|evening|day)\b", re.IGNORECASE),
    re.compile(r"^what'?s up\b", re.IGNORECASE),
    re.compile(r"^nice to meet\b", re.IGNORECASE),
]

TASK_PATTERNS = [
    re.compile(r"(add|create|new|make)\s+(a\s+)?(task|todo|to-do|chore|item)", re.IGNORECASE),
    re.compile(r"(show|list|view|display|get|fetch|load|see)\s+(my\s+)?(task|todo|to-do|chore|item)s?\b", re.IGNORECASE),
    re.compile(r"(mark|complete|finish|done)\s+(a\s+)?(task|todo|to-do|chore|item)", re.IGNORECASE),
    re.compile(r"(task|todo|chore|item).*(done|complete|finish)", re.IGNORECASE),
    re.compile(r"(update|edit|change|modify|rename)\s+(a\s+)?(task|todo|to-do|chore|item)", re.IGNORECASE),
    re.compile(r"(delete|remove|clear|erase|trash)\s+(a\s+)?(task|todo|to-do|chore|item)", re.IGNORECASE),
    re.compile(r"(what|which)\s+(are|is|do|does).*(task|todo)", re.IGNORECASE),
    re.compile(r"^what\s+(task|todo|chore)s?\s+(do|are|did)", re.IGNORECASE),
    re.compile(r"(my|all|the)\s+(task|todo|chore)s?\b", re.IGNORECASE),
    re.compile(r"^(i\s+)?(want|need|like|would)\s+to\s+(add|create|make|show|see|list|view|update|edit|delete|remove|complete|finish|mark)", re.IGNORECASE),
    re.compile(r"^(can|could|will|would)\s+you\s+(add|create|show|list|view|update|edit|delete|remove|complete|finish|mark|help)", re.IGNORECASE),
    re.compile(r"^(please\s+)?(add|create|show|list|delete|remove|update|edit|complete|mark|help)\b", re.IGNORECASE),
    re.compile(r"(task|todo|to-do|chore)\s+(manag|list|item|track)", re.IGNORECASE),
]


def classify_message(message: str) -> GuardrailResult:
    if not message or not message.strip():
        return GuardrailResult.OFF_TOPIC

    message_clean = message.strip()

    has_task_intent = any(p.search(message_clean) for p in TASK_PATTERNS)
    if has_task_intent:
        return GuardrailResult.TASK

    is_greeting = any(p.match(message_clean) for p in GREETING_PATTERNS)
    if is_greeting:
        return GuardrailResult.GREETING

    return GuardrailResult.OFF_TOPIC
