from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from ..models.models import User, UserProfile, Match
from .match_engine import calculate_match_score

def get_compatible_roles(role: str) -> list:
    """
    Determines which roles are compatible with the user's role.
    - Founder -> Developer, Mentor, Investor
    - Developer -> Founder, Mentor
    - Mentor -> Founder, Developer
    - Investor -> Founder
    - Professional -> Founder, Developer, Mentor, Investor, Professional
    """
    role_lower = role.lower()
    if role_lower == "founder":
        return ["Developer", "Mentor", "Investor"]
    elif role_lower == "developer":
        return ["Founder", "Mentor"]
    elif role_lower == "mentor":
        return ["Founder", "Developer"]
    elif role_lower == "investor":
        return ["Founder"]
    else: # Professional / other
        return ["Founder", "Developer", "Mentor", "Investor", "Professional"]

def generate_matches_for_user(user_id: str, db: Session) -> list:
    """
    Generates and saves match recommendations for a given user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.profile:
        return []

    profile = user.profile
    compatible_roles = get_compatible_roles(user.role)

    # Fetch other users with compatible roles who have profiles
    candidates = db.query(User).join(UserProfile).filter(
        User.id != user_id,
        User.role.in_(compatible_roles)
    ).all()

    generated_matches = []

    for candidate in candidates:
        candidate_profile = candidate.profile
        if not candidate_profile:
            continue

        # Check if match already exists in database (either direction)
        existing_match = db.query(Match).filter(
            or_(
                and_(Match.user1_id == user_id, Match.user2_id == candidate.id),
                and_(Match.user1_id == candidate.id, Match.user2_id == user_id)
            )
        ).first()

        # Calculate score and reasons
        match_result = calculate_match_score(user, profile, candidate, candidate_profile)
        score = match_result["score"]
        reasons = match_result["reasons"]

        # We keep matches with a score >= 40% (or save them all and rank them)
        if score >= 40.0:
            if existing_match:
                # Update score and reasons if it hasn't been finalized (pending)
                if existing_match.status == "pending":
                    existing_match.score = score
                    existing_match.reason = reasons
                    db.add(existing_match)
                    generated_matches.append(existing_match)
                else:
                    generated_matches.append(existing_match)
            else:
                # Create a new Match record
                # We save user1_id as the user who has a lower ID string to avoid duplicate row pairings
                u1_id, u2_id = (user_id, candidate.id) if user_id < candidate.id else (candidate.id, user_id)
                new_match = Match(
                    user1_id=u1_id,
                    user2_id=u2_id,
                    score=score,
                    reason=reasons,
                    status="pending"
                )
                db.add(new_match)
                generated_matches.append(new_match)
                
    db.commit()
    
    # Sort matches by score descending
    generated_matches.sort(key=lambda m: m.score, reverse=True)
    return generated_matches

def get_user_matches(user_id: str, db: Session) -> list:
    """
    Retrieves and ranks matches involving the given user from the database.
    """
    matches = db.query(Match).filter(
        or_(Match.user1_id == user_id, Match.user2_id == user_id)
    ).order_by(Match.score.desc()).all()
    
    # Return formatted objects with participant profiles
    results = []
    for match in matches:
        # Determine who the "other" user is
        other_user_id = match.user2_id if match.user1_id == user_id else match.user1_id
        other_user = db.query(User).filter(User.id == other_user_id).first()
        
        if not other_user:
            continue
            
        results.append({
            "id": match.id,
            "user1_id": match.user1_id,
            "user2_id": match.user2_id,
            "user1_name": match.user1.name,
            "user1_role": match.user1.role,
            "user2_name": match.user2.name,
            "user2_role": match.user2.role,
            "score": match.score,
            "reason": match.reason,
            "status": match.status,
            "created_at": match.created_at,
            "other_user": {
                "id": other_user.id,
                "name": other_user.name,
                "role": other_user.role,
                "organization": other_user.organization,
                "location": other_user.location,
                "linkedin": other_user.linkedin,
                "github": other_user.github,
                "bio": other_user.profile.bio if other_user.profile else "",
                "skills": other_user.profile.skills if other_user.profile else [],
                "interests": other_user.profile.interests if other_user.profile else [],
                "goals": other_user.profile.goals if other_user.profile else [],
                "challenges": other_user.profile.challenges if other_user.profile else []
            }
        })
        
    return results
