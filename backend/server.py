from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import time
import json
import uuid
import logging
import asyncio
import base64
from pathlib import Path
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("aura-backend")

# Initialize FastAPI
app = FastAPI(title="Aura Emotional Support API", version="1.0.0")

# CORS setup
origins = [origin.strip() for origin in os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',') if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins if origins else ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Rate Limiter (10 RPM, 1000 RPD)
# ---------------------------------------------------------
RATE_LIMIT_RPM = int(os.environ.get("RATE_LIMIT_RPM", 10))
RATE_LIMIT_RPD = int(os.environ.get("RATE_LIMIT_RPD", 1000))

class SlidingRateLimiter:
    def __init__(self, rpm: int = 10, rpd: int = 1000):
        self.rpm = rpm
        self.rpd = rpd
        self.minute_records: Dict[str, List[float]] = {}
        self.daily_records: Dict[str, List[float]] = {}
        self.lock = asyncio.Lock()

    async def check_and_record(self, key: str) -> Optional[str]:
        """Returns None if allowed, or error code 'rate_limited' / 'daily_limit_reached'"""
        now = time.time()
        one_min_ago = now - 60.0
        one_day_ago = now - 86400.0

        async with self.lock:
            # Clean and check minute requests
            min_times = [t for t in self.minute_records.get(key, []) if t > one_min_ago]
            if len(min_times) >= self.rpm:
                self.minute_records[key] = min_times
                return "rate_limited"

            # Clean and check day requests
            day_times = [t for t in self.daily_records.get(key, []) if t > one_day_ago]
            if len(day_times) >= self.rpd:
                self.daily_records[key] = day_times
                return "daily_limit_reached"

            min_times.append(now)
            day_times.append(now)
            self.minute_records[key] = min_times
            self.daily_records[key] = day_times
            return None

rate_limiter = SlidingRateLimiter(rpm=RATE_LIMIT_RPM, rpd=RATE_LIMIT_RPD)

# ---------------------------------------------------------
# Circular Loop AI Key Rotation (Gemini & Groq)
# ---------------------------------------------------------
class AIKeyRotator:
    def __init__(self):
        gemini_env = os.environ.get("GEMINI_API_KEYS", "")
        groq_env = os.environ.get("GROQ_API_KEYS", "")
        self.gemini_keys = [k.strip() for k in gemini_env.split(",") if k.strip()]
        self.groq_keys = [k.strip() for k in groq_env.split(",") if k.strip()]
        self.gemini_index = 0
        self.groq_index = 0
        self.lock = asyncio.Lock()

    async def get_next_gemini_key(self) -> Optional[str]:
        async with self.lock:
            if not self.gemini_keys:
                return None
            key = self.gemini_keys[self.gemini_index % len(self.gemini_keys)]
            self.gemini_index = (self.gemini_index + 1) % len(self.gemini_keys)
            return key

    async def get_next_groq_key(self) -> Optional[str]:
        async with self.lock:
            if not self.groq_keys:
                return None
            key = self.groq_keys[self.groq_index % len(self.groq_keys)]
            self.groq_index = (self.groq_index + 1) % len(self.groq_keys)
            return key

ai_rotator = AIKeyRotator()

# ---------------------------------------------------------
# In-Memory & Resilient Storage (works without requiring local MongoDB daemon)
# ---------------------------------------------------------
users_db: Dict[str, Dict[str, Any]] = {}
sessions_db: Dict[str, Dict[str, Any]] = {}  # session_id -> session
messages_db: Dict[str, List[Dict[str, Any]]] = {}  # session_id -> messages
assessments_db: Dict[str, List[Dict[str, Any]]] = {}  # user_id -> assessments
tokens_db: Dict[str, str] = {}  # token -> user_id

# ---------------------------------------------------------
# Seed Data: Questionnaire & Crisis Resources
# ---------------------------------------------------------
QUESTIONNAIRE = {
    "instrument_version": "aura-1.0",
    "scales": {
        "frequency_week": [
            {"value": 0, "label": "Did not apply to me at all", "short_label": "Not at all"},
            {"value": 1, "label": "Applied to me to some degree, or some of the time", "short_label": "Some of the time"},
            {"value": 2, "label": "Applied to me to a considerable degree, or a good part of the time", "short_label": "A good part of the time"},
            {"value": 3, "label": "Applied to me very much, or most of the time", "short_label": "Most of the time"},
        ],
        "frequency_2wk": [
            {"value": 0, "label": "Not at all", "short_label": "Not at all"},
            {"value": 1, "label": "Several days", "short_label": "Several days"},
            {"value": 2, "label": "More than half the days", "short_label": "More than half the days"},
            {"value": 3, "label": "Nearly every day", "short_label": "Nearly every day"},
        ],
    },
    "items": [
        {"id": "sup_brightness", "text": "I had moments when I felt cheerful, calm or content", "scale": "frequency_week", "section": "extra"},
        {"id": "dass_01", "text": "I found it hard to wind down", "scale": "frequency_week", "section": "main"},
        {"id": "dass_02", "text": "I was aware of dryness of my mouth", "scale": "frequency_week", "section": "main"},
        {"id": "dass_03", "text": "I couldn't seem to experience any positive feeling at all", "scale": "frequency_week", "section": "main"},
        {"id": "dass_04", "text": "I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion)", "scale": "frequency_week", "section": "main"},
        {"id": "dass_05", "text": "I found it difficult to work up the initiative to do things", "scale": "frequency_week", "section": "main"},
        {"id": "dass_06", "text": "I tended to over-react to situations", "scale": "frequency_week", "section": "main"},
        {"id": "dass_07", "text": "I experienced trembling (e.g. in the hands)", "scale": "frequency_week", "section": "main"},
        {"id": "dass_08", "text": "I felt that I was using a lot of nervous energy", "scale": "frequency_week", "section": "main"},
        {"id": "dass_09", "text": "I was worried about situations in which I might panic and make a fool of myself", "scale": "frequency_week", "section": "main"},
        {"id": "dass_10", "text": "I felt that I had nothing to look forward to", "scale": "frequency_week", "section": "main"},
        {"id": "dass_11", "text": "I found myself getting agitated", "scale": "frequency_week", "section": "main"},
        {"id": "dass_12", "text": "I found it difficult to relax", "scale": "frequency_week", "section": "main"},
        {"id": "dass_13", "text": "I felt down-hearted and blue", "scale": "frequency_week", "section": "main"},
        {"id": "dass_14", "text": "I was intolerant of anything that kept me from getting on with what I was doing", "scale": "frequency_week", "section": "main"},
        {"id": "dass_15", "text": "I felt I was close to panic", "scale": "frequency_week", "section": "main"},
        {"id": "dass_16", "text": "I was unable to become enthusiastic about anything", "scale": "frequency_week", "section": "main"},
        {"id": "dass_17", "text": "I felt I wasn't worth much as a person", "scale": "frequency_week", "section": "main"},
        {"id": "dass_18", "text": "I felt that I was rather touchy", "scale": "frequency_week", "section": "main"},
        {"id": "dass_19", "text": "I was aware of the action of my heart in the absence of physical exertion", "scale": "frequency_week", "section": "main"},
        {"id": "dass_20", "text": "I felt scared without any good reason", "scale": "frequency_week", "section": "main"},
        {"id": "dass_21", "text": "I felt that life was meaningless", "scale": "frequency_week", "section": "main"},
        {"id": "sup_anger", "text": "I felt angry or resentful about things", "scale": "frequency_week", "section": "extra"},
        {"id": "sup_tiredness", "text": "I felt worn out, even after resting", "scale": "frequency_week", "section": "extra"},
        {"id": "sup_grief", "text": "I felt weighed down by a loss, or by missing someone or something", "scale": "frequency_week", "section": "extra"},
        {"id": "sup_sadness", "text": "I felt sad or teary", "scale": "frequency_week", "section": "extra"},
        {"id": "mask_hide", "text": "I put a lot of effort into hiding how I really feel from other people", "scale": "frequency_week", "section": "extra"},
        {"id": "mask_push", "text": "When something upset me, I pushed the feeling down instead of dealing with it", "scale": "frequency_week", "section": "extra"},
        {"id": "safe_01", "text": "Have you had thoughts that you would be better off dead, or of hurting yourself in some way?", "scale": "frequency_2wk", "section": "safety"},
    ],
}

SUBSCALES = {
    "stress": ["dass_01", "dass_06", "dass_08", "dass_11", "dass_12", "dass_14", "dass_18"],
    "anxiety": ["dass_02", "dass_04", "dass_07", "dass_09", "dass_15", "dass_19", "dass_20"],
    "low_mood": ["dass_03", "dass_05", "dass_10", "dass_13", "dass_16", "dass_17", "dass_21"],
}
DASS_BANDS = {
    "stress": [14, 18, 25],
    "anxiety": [7, 9, 14],
    "low_mood": [9, 13, 20],
}

CRISIS_RESOURCES = [
    {"id": "us-988-suicide-crisis-lifeline", "country_code": "US", "name": "988 Suicide & Crisis Lifeline", "description": "Free, confidential support from trained counselors. Call or text.", "phone": "988", "sms": "988", "url": "https://988lifeline.org", "hours": "24/7", "is_emergency": False},
    {"id": "us-emergency-services", "country_code": "US", "name": "Emergency services", "description": "If you are in immediate danger.", "phone": "911", "sms": None, "url": None, "hours": "24/7", "is_emergency": True},
    {"id": "in-tele-manas", "country_code": "IN", "name": "Tele-MANAS", "description": "Free mental health support in many languages. Also reachable on 1-800-891-4416.", "phone": "14416", "sms": None, "url": "https://telemanas.mohfw.gov.in", "hours": "24/7", "is_emergency": False},
    {"id": "in-emergency-services", "country_code": "IN", "name": "Emergency services", "description": "If you are in immediate danger.", "phone": "112", "sms": None, "url": None, "hours": "24/7", "is_emergency": True},
    {"id": "uk-samaritans", "country_code": "UK", "name": "Samaritans", "description": "A safe place to talk, whatever you are going through.", "phone": "116 123", "sms": None, "url": "https://www.samaritans.org", "hours": "24/7", "is_emergency": False},
    {"id": "uk-emergency-services", "country_code": "UK", "name": "Emergency services", "description": "If you are in immediate danger.", "phone": "999", "sms": None, "url": None, "hours": "24/7", "is_emergency": True},
    {"id": "ca-9-8-8-suicide-crisis-helpline", "country_code": "CA", "name": "9-8-8 Suicide Crisis Helpline", "description": "Trained responders, in English and French. Call or text.", "phone": "988", "sms": "988", "url": "https://988.ca", "hours": "24/7", "is_emergency": False},
    {"id": "ca-emergency-services", "country_code": "CA", "name": "Emergency services", "description": "If you are in immediate danger.", "phone": "911", "sms": None, "url": None, "hours": "24/7", "is_emergency": True},
    {"id": "intl-find-a-helpline", "country_code": "INTL", "name": "Find a Helpline", "description": "A directory of free, confidential helplines in many countries.", "phone": None, "sms": None, "url": "https://findahelpline.com", "hours": "Varies by service", "is_emergency": False},
]

# ---------------------------------------------------------
# Pydantic Models matching Frontend Types
# ---------------------------------------------------------
class SignUpInput(BaseModel):
    email: str
    password: str
    display_name: Optional[str] = None
    country_code: Optional[str] = None

class LoginInput(BaseModel):
    email: str
    password: str

class AuthSession(BaseModel):
    token: str
    user_id: str
    email: str

class Profile(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None
    country_code: Optional[str] = None
    consent_given: bool = False
    assessment_status: str = "not_started"
    accent: str = "apricot"
    theme_mode: str = "light"
    text_size: str = "md"
    auto_send_voice: bool = False
    created_at: str
    stt_language: Optional[str] = None  # Newly requested field mirrored!

class ProfilePatch(BaseModel):
    display_name: Optional[str] = None
    country_code: Optional[str] = None
    accent: Optional[str] = None
    theme_mode: Optional[str] = None
    text_size: Optional[str] = None
    auto_send_voice: Optional[bool] = None
    stt_language: Optional[str] = None

class AnswerInput(BaseModel):
    item_id: str
    value: Optional[int] = None

class AssessmentSubmitInput(BaseModel):
    answers: List[AnswerInput]

class DimensionResult(BaseModel):
    key: str
    score_pct: int
    band: str

class AssessmentResult(BaseModel):
    id: str
    created_at: str
    dimensions: List[DimensionResult]
    show_support_card: bool

class ChatSession(BaseModel):
    id: str
    title: str
    last_message_at: str
    created_at: str

class SessionDetail(BaseModel):
    session: ChatSession
    messages: List[Dict[str, Any]]

class RenameSessionInput(BaseModel):
    title: str

class SendMessageInput(BaseModel):
    content: str
    input_mode: str = "text"
    client_message_id: str

# ---------------------------------------------------------
# Helper Dependencies
# ---------------------------------------------------------
def extract_jwt_claims(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split(".")
        if len(parts) == 3:
            payload_b64 = parts[1]
            rem = len(payload_b64) % 4
            if rem > 0:
                payload_b64 += "=" * (4 - rem)
            decoded = base64.urlsafe_b64decode(payload_b64).decode("utf-8")
            return json.loads(decoded)
    except Exception:
        pass
    return None

async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        # For ease in preview, fall back to guest user if no header
        return "preview_user_id"
    token = authorization.split("Bearer ")[1].strip()
    
    # Check tokens_db first (for local server tokens)
    user_id = tokens_db.get(token)
    if user_id:
        return user_id

    # If it is a Supabase JWT, decode claims to identify user
    claims = extract_jwt_claims(token)
    if claims and "sub" in claims:
        sup_uid = claims["sub"]
        sup_email = claims.get("email", f"{sup_uid[:8]}@user.aura")
        user_obj = ensure_user(sup_uid, email=sup_email)
        meta = claims.get("user_metadata", {})
        if meta.get("display_name") and not user_obj.get("display_name"):
            user_obj["display_name"] = meta["display_name"]
        if meta.get("country_code") and user_obj.get("country_code") == "US":
            user_obj["country_code"] = meta["country_code"]
        return sup_uid

    return "preview_user_id"

def ensure_user(user_id: str, email: str = "guest@example.com") -> Dict[str, Any]:
    if user_id not in users_db:
        now_str = datetime.now(timezone.utc).isoformat()
        users_db[user_id] = {
            "id": user_id,
            "email": email,
            "display_name": None,
            "country_code": "US",
            "consent_given": True,
            "assessment_status": "not_started",
            "accent": "apricot",
            "theme_mode": "light",
            "text_size": "md",
            "auto_send_voice": False,
            "created_at": now_str,
            "stt_language": None,
        }
    return users_db[user_id]

# ---------------------------------------------------------
# API Routes: /v1
# ---------------------------------------------------------
v1_router = APIRouter(prefix="/v1")

# --- AUTH ---
@v1_router.post("/auth/signup", response_model=AuthSession)
async def signup(input: SignUpInput):
    uid = str(uuid.uuid4())
    token = f"aura_token_{uuid.uuid4().hex}"
    tokens_db[token] = uid
    now_str = datetime.now(timezone.utc).isoformat()
    users_db[uid] = {
        "id": uid,
        "email": input.email,
        "display_name": input.display_name,
        "country_code": input.country_code or "US",
        "consent_given": False,
        "assessment_status": "not_started",
        "accent": "apricot",
        "theme_mode": "light",
        "text_size": "md",
        "auto_send_voice": False,
        "created_at": now_str,
        "stt_language": None,
    }
    return AuthSession(token=token, user_id=uid, email=input.email)

@v1_router.post("/auth/login", response_model=AuthSession)
async def login(input: LoginInput):
    for uid, u in users_db.items():
        if u["email"].lower() == input.email.lower():
            token = f"aura_token_{uuid.uuid4().hex}"
            tokens_db[token] = uid
            return AuthSession(token=token, user_id=uid, email=u["email"])
    # If not found, create new session for demo convenience
    return await signup(SignUpInput(email=input.email, password=input.password))

@v1_router.post("/auth/google", response_model=AuthSession)
async def google_login():
    uid = str(uuid.uuid4())
    token = f"aura_token_{uuid.uuid4().hex}"
    tokens_db[token] = uid
    email = f"google_user_{uid[:6]}@example.com"
    ensure_user(uid, email=email)
    return AuthSession(token=token, user_id=uid, email=email)

@v1_router.post("/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
        tokens_db.pop(token, None)
    return {"ok": True}

# --- PROFILE & ME ---
@v1_router.get("/me", response_model=Profile)
async def get_me(user_id: str = Depends(get_current_user_id)):
    u = ensure_user(user_id)
    return Profile(**u)

@v1_router.patch("/me", response_model=Profile)
async def update_me(patch: ProfilePatch, user_id: str = Depends(get_current_user_id)):
    u = ensure_user(user_id)
    patch_data = patch.model_dump(exclude_unset=True)
    u.update(patch_data)
    return Profile(**u)

@v1_router.post("/me/consent", response_model=Profile)
async def give_consent(user_id: str = Depends(get_current_user_id)):
    u = ensure_user(user_id)
    u["consent_given"] = True
    return Profile(**u)

@v1_router.delete("/me")
async def delete_account(user_id: str = Depends(get_current_user_id)):
    users_db.pop(user_id, None)
    assessments_db.pop(user_id, None)
    return {"ok": True}

@v1_router.get("/me/export")
async def export_data(user_id: str = Depends(get_current_user_id)):
    u = ensure_user(user_id)
    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "profile": u,
        "check_ins": assessments_db.get(user_id, []),
    }

# --- ASSESSMENT & WEATHER HISTORY ---
def calculate_dass_score(answers: List[AnswerInput]) -> List[DimensionResult]:
    bands_list = ['low', 'mild', 'moderate', 'high']
    ans_map = {a.item_id: a.value for a in answers}

    results: List[DimensionResult] = []
    for key, item_ids in SUBSCALES.items():
        vals = [ans_map.get(iid) for iid in item_ids if ans_map.get(iid) is not None]
        if len(vals) < 5:
            results.append(DimensionResult(key=key, score_pct=0, band='low'))
            continue
        x2 = sum(vals) * 2
        lo, mi, mo = DASS_BANDS[key]
        band = 'low' if x2 <= lo else 'mild' if x2 <= mi else 'moderate' if x2 <= mo else 'high'
        score_pct = min(100, round((x2 / 42.0) * 100))
        results.append(DimensionResult(key=key, score_pct=score_pct, band=band))

    single_dims = [
        ('anger', 'sup_anger'),
        ('tiredness', 'sup_tiredness'),
        ('grief', 'sup_grief'),
        ('sadness', 'sup_sadness'),
        ('brightness', 'sup_brightness'),
    ]
    for key, iid in single_dims:
        v = ans_map.get(iid)
        if v is None:
            results.append(DimensionResult(key=key, score_pct=0, band='low'))
        else:
            band = bands_list[min(v, 3)]
            results.append(DimensionResult(key=key, score_pct=round((v / 3.0) * 100), band=band))
    return results

@v1_router.get("/assessment/questionnaire")
async def get_questionnaire():
    return QUESTIONNAIRE

@v1_router.post("/assessment/submit", response_model=AssessmentResult)
async def submit_assessment(input: AssessmentSubmitInput, user_id: str = Depends(get_current_user_id)):
    ensure_user(user_id)
    safe_val = next((a.value for a in input.answers if a.item_id == "safe_01"), 0) or 0
    dimensions = calculate_dass_score(input.answers)
    result = AssessmentResult(
        id=str(uuid.uuid4()),
        created_at=datetime.now(timezone.utc).isoformat(),
        dimensions=dimensions,
        show_support_card=(safe_val > 0)
    )
    if user_id not in assessments_db:
        assessments_db[user_id] = []
    assessments_db[user_id].append(result.model_dump())
    users_db[user_id]["assessment_status"] = "completed"
    return result

@v1_router.post("/assessment/skip")
async def skip_assessment(user_id: str = Depends(get_current_user_id)):
    u = ensure_user(user_id)
    if u["assessment_status"] != "completed":
        u["assessment_status"] = "skipped"
    return {"ok": True}

@v1_router.get("/assessment/latest", response_model=Optional[AssessmentResult])
async def get_latest_assessment(user_id: str = Depends(get_current_user_id)):
    history = assessments_db.get(user_id, [])
    if not history:
        return None
    return AssessmentResult(**history[-1])

# NOTE: Implemented GET /v1/assessment/history marked // TODO(Antigravity)
@v1_router.get("/assessment/history", response_model=List[AssessmentResult])
async def get_assessment_history(user_id: str = Depends(get_current_user_id)):
    """Returns assessment snapshots, newest first."""
    history = assessments_db.get(user_id, [])
    # Return newest first (reversed)
    return [AssessmentResult(**item) for item in reversed(history)]

# --- CHAT SESSIONS & STREAMING WITH RATE LIMITING & KEY ROTATION ---
@v1_router.get("/chat/sessions")
async def list_sessions(user_id: str = Depends(get_current_user_id), q: Optional[str] = None):
    user_sessions = [s for s in sessions_db.values() if s.get("user_id") == user_id]
    if q:
        user_sessions = [s for s in user_sessions if q.lower() in s.get("title", "").lower()]
    user_sessions.sort(key=lambda s: s.get("last_message_at", ""), reverse=True)
    return {"items": user_sessions, "next_cursor": None}

@v1_router.post("/chat/sessions", response_model=ChatSession)
async def create_session(user_id: str = Depends(get_current_user_id)):
    sid = str(uuid.uuid4())
    now_str = datetime.now(timezone.utc).isoformat()
    session = {
        "id": sid,
        "user_id": user_id,
        "title": "Quiet moment",
        "last_message_at": now_str,
        "created_at": now_str,
    }
    sessions_db[sid] = session
    messages_db[sid] = []
    return ChatSession(**session)

@v1_router.get("/chat/sessions/{session_id}", response_model=SessionDetail)
async def get_session(session_id: str, user_id: str = Depends(get_current_user_id)):
    session = sessions_db.get(session_id)
    if not session:
        now_str = datetime.now(timezone.utc).isoformat()
        session = {"id": session_id, "user_id": user_id, "title": "Quiet moment", "last_message_at": now_str, "created_at": now_str}
        sessions_db[session_id] = session
        messages_db[session_id] = []
    messages = messages_db.get(session_id, [])
    return SessionDetail(session=ChatSession(**session), messages=messages)

@v1_router.patch("/chat/sessions/{session_id}", response_model=ChatSession)
async def rename_session(session_id: str, input: RenameSessionInput):
    session = sessions_db.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session["title"] = input.title
    return ChatSession(**session)

@v1_router.delete("/chat/sessions/{session_id}")
async def delete_session(session_id: str):
    sessions_db.pop(session_id, None)
    messages_db.pop(session_id, None)
    return {"ok": True}

@v1_router.delete("/chat/sessions")
async def delete_all_sessions(user_id: str = Depends(get_current_user_id)):
    to_delete = [sid for sid, s in sessions_db.items() if s.get("user_id") == user_id]
    for sid in to_delete:
        sessions_db.pop(sid, None)
        messages_db.pop(sid, None)
    return {"ok": True}

# Therapeutic Warm Streaming Generator with Multi-Key Circular Failover
async def stream_chat_response(session_id: str, user_id: str, user_msg: str, user_msg_id: str):
    asst_msg_id = str(uuid.uuid4())

    # 1. Check Rate Limiter
    limit_error = await rate_limiter.check_and_record(user_id)
    if limit_error:
        yield f"data: {json.dumps({'type': 'error', 'code': limit_error, 'message': 'Aura needs a little rest. You can come back soon.'})}\n\n"
        return

    # 2. Emit meta event
    yield f"data: {json.dumps({'type': 'meta', 'user_message_id': user_msg_id, 'assistant_message_id': asst_msg_id})}\n\n"
    await asyncio.sleep(0.05)

    # 3. Check safety cues
    safety_cues = ["hurt myself", "kill myself", "suicide", "end it all", "[test-high]", "[test-imminent]"]
    is_crisis = any(cue in user_msg.lower() for cue in safety_cues)
    if is_crisis:
        yield f"data: {json.dumps({'type': 'safety', 'level': 'high', 'show_crisis_card': True})}\n\n"

    # 4. Attempt AI inference using Circular Key Rotator (Gemini -> Groq -> Warm Fallback)
    reply_generated = False

    # Try Gemini Key Circular Loop
    gemini_key = await ai_rotator.get_next_gemini_key()
    if gemini_key:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
                payload = {
                    "contents": [{"parts": [{"text": f"You are Aura, a gentle, compassionate emotional support companion. Speak in warm, concise, conversational sentences without diagnosing or giving medical advice. Be validating, calm, and grounded.\nUser: {user_msg}"}]}],
                    "generationConfig": {"temperature": 0.7, "maxOutputTokens": 300}
                }
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    if text:
                        words = text.split(" ")
                        for w in words:
                            yield f"data: {json.dumps({'type': 'token', 'delta': w + ' '})}\n\n"
                            await asyncio.sleep(0.03)
                        reply_generated = True
        except Exception as e:
            logger.warning(f"Gemini generation error: {e}, falling back...")

    # Try Groq Key Circular Loop if Gemini didn't complete
    if not reply_generated:
        groq_key = await ai_rotator.get_next_groq_key()
        if groq_key:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    url = "https://api.groq.com/openai/v1/chat/completions"
                    headers = {"Authorization": f"Bearer {groq_key}"}
                    payload = {
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": "You are Aura, a warm, compassionate emotional support companion. Keep answers gentle, calm, grounding, and concise."},
                            {"role": "user", "content": user_msg}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 250
                    }
                    res = await client.post(url, json=payload, headers=headers)
                    if res.status_code == 200:
                        text = res.json()["choices"][0]["message"]["content"]
                        words = text.split(" ")
                        for w in words:
                            yield f"data: {json.dumps({'type': 'token', 'delta': w + ' '})}\n\n"
                            await asyncio.sleep(0.03)
                        reply_generated = True
            except Exception as e:
                logger.warning(f"Groq generation error: {e}, using warm fallback...")

    # Warm Therapeutic Default Streaming Fallback (Preview Mode)
    if not reply_generated:
        fallback_replies = [
            "Thank you for telling me. That sounds like a lot to hold at once. What feels heaviest right now?",
            "I'm really glad you reached out. There's no rush here, so take whatever time you need. What's been on your mind most today?",
            "That makes a lot of sense. Anyone in your place might feel the same. Would it help to talk it through a little more?",
            "It sounds like you've been carrying this for a while. You don't have to figure it all out tonight. What would feel like a small kindness to yourself right now?",
            "I hear you. Feelings like this can be exhausting, and it's okay to name them. How is your body feeling as you share this?"
        ]
        import random
        text = random.choice(fallback_replies)
        words = text.split(" ")
        for w in words:
            yield f"data: {json.dumps({'type': 'token', 'delta': w + ' '})}\n\n"
            await asyncio.sleep(0.04)

    # 5. Emit title if first message
    yield f"data: {json.dumps({'type': 'title', 'title': 'Quiet moment'})}\n\n"
    # 6. Emit done
    yield f"data: {json.dumps({'type': 'done', 'finish_reason': 'stop'})}\n\n"

@v1_router.post("/chat/sessions/{session_id}/messages")
async def send_message(session_id: str, input: SendMessageInput, request: Request, user_id: str = Depends(get_current_user_id)):
    user_msg_id = input.client_message_id or str(uuid.uuid4())
    now_str = datetime.now(timezone.utc).isoformat()
    if session_id not in messages_db:
        messages_db[session_id] = []
    messages_db[session_id].append({
        "id": user_msg_id,
        "session_id": session_id,
        "role": "user",
        "content": input.content,
        "input_mode": input.input_mode,
        "safety_level": "none",
        "created_at": now_str,
    })
    return StreamingResponse(
        stream_chat_response(session_id, user_id, input.content, user_msg_id),
        media_type="text/event-stream"
    )

# --- SAFETY ---
@v1_router.get("/safety/resources")
async def get_safety_resources(country: Optional[str] = "INTL"):
    cc = (country or "INTL").upper()
    matching = [r for r in CRISIS_RESOURCES if r["country_code"] == cc]
    if not matching:
        matching = [r for r in CRISIS_RESOURCES if r["country_code"] == "INTL"]
    return matching

# Include v1 router in FastAPI app
app.include_router(v1_router)

@app.get("/")
async def root():
    return {"status": "ok", "app": "Aura Backend API", "version": "1.0.0"}