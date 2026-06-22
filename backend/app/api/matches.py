from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.models import User
from ..auth.auth_handler import get_current_user
from ..services.recommendation_service import generate_matches_for_user, get_user_matches

router = APIRouter(prefix="/matches", tags=["Matchmaking Engine"])

@router.get("")
def get_matches(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns existing matches for the authenticated user.
    """
    matches = get_user_matches(current_user.id, db)
    return matches

@router.post("/generate")
def generate_matches(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Manually triggers regeneration of matches for the user.
    """
    generate_matches_for_user(current_user.id, db)
    matches = get_user_matches(current_user.id, db)
    return {
        "message": f"Successfully generated {len(matches)} matches",
        "matches": matches
    }
