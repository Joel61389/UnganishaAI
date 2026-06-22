from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.models import User, UserProfile
from ..schemas.schemas import ProfileResponse, ProfileUpdate
from ..auth.auth_handler import get_current_user
from ..services.embedding_service import get_embedding
from ..services.recommendation_service import generate_matches_for_user

router = APIRouter(prefix="/profile", tags=["Profile Management"])

@router.get("", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile

@router.put("", response_model=ProfileResponse)
def update_profile(profile_data: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    # Update fields if provided
    if profile_data.bio is not None:
        profile.bio = profile_data.bio
    if profile_data.industry is not None:
        profile.industry = profile_data.industry
    if profile_data.skills is not None:
        profile.skills = profile_data.skills
    if profile_data.interests is not None:
        profile.interests = profile_data.interests
    if profile_data.goals is not None:
        profile.goals = profile_data.goals
    if profile_data.challenges is not None:
        profile.challenges = profile_data.challenges
    if profile_data.expertise is not None:
        profile.expertise = profile_data.expertise
    if profile_data.experience_years is not None:
        profile.experience_years = profile_data.experience_years

    # Re-calculate embeddings since profile has changed
    skills_text = ", ".join(profile.skills) if profile.skills else ""
    goals_text = ", ".join((profile.goals or []) + (profile.challenges or []))
    
    skills_emb = get_embedding(skills_text) if skills_text else []
    goals_emb = get_embedding(goals_text) if goals_text else []
    
    profile.embedding = {
        "skills": skills_emb,
        "goals": goals_emb
    }
    
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    # Re-generate matches with the updated profile details
    generate_matches_for_user(current_user.id, db)
    
    return profile
