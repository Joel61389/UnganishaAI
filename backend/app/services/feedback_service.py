from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.models import Feedback, Introduction, Match, User

def submit_feedback(user_id: str, intro_id: str, rating: int, comments: str, 
                    would_collaborate: bool, verified: bool, db: Session) -> Feedback:
    """
    Saves feedback from a user regarding a specific introduction.
    Also updates the parent introduction and match statuses if feedback is completed.
    """
    # Verify introduction exists
    intro = db.query(Introduction).filter(Introduction.id == intro_id).first()
    if not intro:
        raise ValueError("Introduction not found")
        
    # Check if user is part of the match
    match = db.query(Match).filter(Match.id == intro.match_id).first()
    if not match or (match.user1_id != user_id and match.user2_id != user_id):
        raise PermissionError("User is not part of this introduction match")
        
    # Check if user already submitted feedback
    existing_feedback = db.query(Feedback).filter(
        Feedback.introduction_id == intro_id,
        Feedback.user_id == user_id
    ).first()
    
    if existing_feedback:
        existing_feedback.rating = rating
        existing_feedback.comments = comments
        existing_feedback.would_collaborate = would_collaborate
        existing_feedback.verified = verified
        db.add(existing_feedback)
        feedback = existing_feedback
    else:
        feedback = Feedback(
            introduction_id=intro_id,
            user_id=user_id,
            rating=rating,
            comments=comments,
            would_collaborate=would_collaborate,
            verified=verified
        )
        db.add(feedback)
        
    db.commit()
    db.refresh(feedback)
    
    # Update payment status based on feedback verification
    if intro.payment_status == "escrowed":
        if verified:
            intro.payment_status = "released"
        else:
            intro.payment_status = "refunded"
        db.add(intro)
        db.commit()
    
    # Check if both parties have submitted feedback
    feedbacks = db.query(Feedback).filter(Feedback.introduction_id == intro_id).all()
    if len(feedbacks) >= 2:
        # If both verified the introduction, set introduction as accepted/verified
        all_verified = all(fb.verified for fb in feedbacks)
        if all_verified:
            intro.accepted = True
            db.add(intro)
            db.commit()
            
    return feedback

def get_introduction_feedback(intro_id: str, db: Session) -> list:
    return db.query(Feedback).filter(Feedback.introduction_id == intro_id).all()

def get_feedback_stats(db: Session) -> dict:
    """
    Calculates summary metrics for the feedback loop.
    """
    total = db.query(Feedback).count()
    if total == 0:
        return {
            "total_feedbacks": 0,
            "average_rating": 0.0,
            "verification_rate": 0.0,
            "collaboration_rate": 0.0
        }
        
    avg_rating = db.query(func.avg(Feedback.rating)).scalar() or 0.0
    verified_count = db.query(Feedback).filter(Feedback.verified == True).count()
    collab_count = db.query(Feedback).filter(Feedback.would_collaborate == True).count()
    
    return {
        "total_feedbacks": total,
        "average_rating": round(float(avg_rating), 2),
        "verification_rate": round((verified_count / total) * 100, 1),
        "collaboration_rate": round((collab_count / total) * 100, 1)
    }
