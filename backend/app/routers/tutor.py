from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai

from ..config import settings

router = APIRouter(tags=["tutor"]) 

class AskRequest(BaseModel):
    question: str
    context: Optional[str] = None

class AskResponse(BaseModel):
    answer: str

# Initialize Gemini client lazily
_model = None

def get_model():
    global _model
    if _model is None:
        if not settings.GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="Gemini API key is not configured on the server")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Use configured Gemini model (default: gemini-1.5-flash)
        model_name = settings.GEMINI_MODEL or "gemini-1.5-flash"
        _model = genai.GenerativeModel(model_name)
    return _model

@router.post("/tutor/ask", response_model=AskResponse)
async def ask_tutor(req: AskRequest) -> AskResponse:
    """Ask the AI tutor a concise question. Returns a short, focused answer."""
    try:
        model = get_model()
        prompt = req.question if not req.context else f"Context: {req.context}\n\nQuestion: {req.question}\n\nAnswer concisely:"
        result = await model.generate_content_async(prompt)
        # Extract text; fall back to empty string
        text = getattr(result, "text", None)
        if not text:
            text = "I couldn't generate a response. Please try rephrasing your question."
        # Keep the response concise (server-side guard)
        trimmed = text.strip()
        if len(trimmed) > 1200:
            trimmed = trimmed[:1200].rstrip() + "..."
        return AskResponse(answer=trimmed)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tutor error: {str(e)}")
