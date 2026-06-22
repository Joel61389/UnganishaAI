from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database.session import get_db
from ..models.models import User, Feedback, Introduction, Match
from ..schemas.schemas import FeedbackCreate, FeedbackResponse, FeedbackStats
from ..auth.auth_handler import get_current_user
from ..services.feedback_service import submit_feedback, get_feedback_stats, get_introduction_feedback

router = APIRouter(prefix="/feedback", tags=["Feedback & Verification"])

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def post_feedback(feedback_data: FeedbackCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        fb = submit_feedback(
            user_id=current_user.id,
            intro_id=feedback_data.introduction_id,
            rating=feedback_data.rating,
            comments=feedback_data.comments or "",
            would_collaborate=feedback_data.would_collaborate,
            verified=feedback_data.verified,
            db=db
        )
        return fb
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )

@router.get("", response_model=list[FeedbackResponse])
def get_user_feedbacks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns feedback submitted by the current user.
    """
    return db.query(Feedback).filter(Feedback.user_id == current_user.id).order_by(Feedback.created_at.desc()).all()

@router.get("/stats", response_model=FeedbackStats)
def get_stats(db: Session = Depends(get_db)):
    """
    Returns aggregated feedback metrics.
    """
    stats = get_feedback_stats(db)
    return stats
