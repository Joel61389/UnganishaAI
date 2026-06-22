from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel

from ..database.session import get_db
from ..models.models import User, Match, Introduction, UserProfile
from ..auth.auth_handler import get_current_user
from ..services.introduction_service import generate_introduction

router = APIRouter(prefix="/introductions", tags=["Introductions System"])

class IntroductionRequest(BaseModel):
    match_id: str

@router.post("", status_code=status.HTTP_201_CREATED)
def create_introduction(req: IntroductionRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Fetch match
    match = db.query(Match).filter(Match.id == req.match_id).first()
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )
        
    # Check if current user is part of the match
    if match.user1_id != current_user.id and match.user2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to introduce these users"
        )
        
    # Check if introduction already exists
    existing_intro = db.query(Introduction).filter(Introduction.match_id == req.match_id).first()
    if existing_intro:
        return existing_intro

    # 2. Fetch both users and profiles
    user1 = db.query(User).filter(User.id == match.user1_id).first()
    user2 = db.query(User).filter(User.id == match.user2_id).first()
    profile1 = db.query(UserProfile).filter(UserProfile.user_id == match.user1_id).first()
    profile2 = db.query(UserProfile).filter(UserProfile.user_id == match.user2_id).first()

    if not user1 or not user2 or not profile1 or not profile2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profiles for both users must exist to generate an introduction"
        )

    # 3. Generate intro message using the service
    intro_message = generate_introduction(user1, profile1, user2, profile2, match.score, match.reason)

    # 4. Save Introduction
    new_intro = Introduction(
        match_id=match.id,
        introduction_message=intro_message,
        accepted=False,
        sent=True # Sent automatically in MVP
    )
    
    # 5. Update Match status to introduced
    match.status = "introduced"
    
    db.add(new_intro)
    db.add(match)
    db.commit()
    db.refresh(new_intro)
    
    return new_intro

@router.get("")
def get_introductions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns all introductions involving the current user.
    """
    intros = db.query(Introduction).join(Match).filter(
        or_(Match.user1_id == current_user.id, Match.user2_id == current_user.id)
    ).order_by(Introduction.created_at.desc()).all()
    
    results = []
    for intro in intros:
        # Load match details
        match = db.query(Match).filter(Match.id == intro.match_id).first()
        if not match:
            continue
            
        other_user_id = match.user2_id if match.user1_id == current_user.id else match.user1_id
        other_user = db.query(User).filter(User.id == other_user_id).first()
        
        results.append({
            "id": intro.id,
            "match_id": intro.match_id,
            "introduction_message": intro.introduction_message,
            "accepted": intro.accepted,
            "sent": intro.sent,
            "created_at": intro.created_at,
            "match_details": {
                "score": match.score,
                "reason": match.reason,
                "other_user_name": other_user.name if other_user else "Unknown User",
                "other_user_role": other_user.role if other_user else "Unknown Role",
                "other_user_org": other_user.organization if other_user else ""
            }
        })
        
    return results
