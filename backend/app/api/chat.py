from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from ..database.session import get_db
from ..models.models import User, ChatMessage, UserProfile
from ..schemas.schemas import ChatMessageCreate, ChatMessageResponse, ChatMessagePostResponse, ProfileResponse
from ..auth.auth_handler import get_current_user
from ..services.profile_extractor import extract_profile
from ..services.embedding_service import get_embedding
from ..services.recommendation_service import generate_matches_for_user

router = APIRouter(prefix="/chat", tags=["Chat & Onboarding"])

ONBOARDING_QUESTIONS = [
    "Welcome to Unganisha AI! Let's get you set up. First, who are you, what do you do, and which industry are you active in? (e.g. founder, developer, mentor, etc.)",
    "Awesome. What are your top professional skills, and which specific technologies are you proficient in?",
    "Got it. What are your main goals on the platform? (e.g., finding a co-founder, hiring developers, funding, networking, mentorship, projects)",
    "What challenges or roadblocks are you currently facing in achieving those goals? (e.g. software development help, marketing, fundraising support)",
    "What specific interests or sectors are you passionate about? (e.g. AI, FinTech, AgriTech, EdTech, Climate Tech, Web3)",
]

@router.get("/history", response_model=list[ChatMessageResponse])
def get_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).order_by(ChatMessage.created_at.asc()).all()
    
    # If history is empty, initialize it with the first question
    if not messages:
        welcome_msg = ChatMessage(
            user_id=current_user.id,
            sender="assistant",
            message=ONBOARDING_QUESTIONS[0]
        )
        db.add(welcome_msg)
        db.commit()
        db.refresh(welcome_msg)
        messages = [welcome_msg]
        
    return messages

@router.post("/message", response_model=ChatMessagePostResponse)
def send_message(msg_data: ChatMessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Save User Message
    user_msg = ChatMessage(
        user_id=current_user.id,
        sender="user",
        message=msg_data.message
    )
    db.add(user_msg)
    db.commit()
    
    # 2. Retrieve history to count how many assistant messages have been sent
    history = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).order_by(ChatMessage.created_at.asc()).all()
    assistant_msgs = [m for m in history if m.sender == "assistant"]
    num_questions_asked = len(assistant_msgs)
    
    response_text = ""
    profile_updated = False
    
    if num_questions_asked < len(ONBOARDING_QUESTIONS):
        # Send next onboarding question
        response_text = ONBOARDING_QUESTIONS[num_questions_asked]
    else:
        # Onboarding questions complete, compile history and run profile extraction
        # Aggregate all messages in the chat
        full_chat_text = "\n".join([f"{m.sender.capitalize()}: {m.message}" for m in history])
        
        # Call Profile Extractor service
        extracted_data = extract_profile(full_chat_text, default_role=current_user.role)
        
        # Update User role in the users table
        if "role" in extracted_data:
            current_user.role = extracted_data["role"]
            db.add(current_user)
            
        # Get or create UserProfile
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        if not profile:
            profile = UserProfile(user_id=current_user.id)
            
        profile.bio = extracted_data.get("bio", profile.bio)
        profile.industry = extracted_data.get("industry", profile.industry)
        profile.skills = extracted_data.get("skills", profile.skills)
        profile.interests = extracted_data.get("interests", profile.interests)
        profile.goals = extracted_data.get("goals", profile.goals)
        profile.challenges = extracted_data.get("challenges", profile.challenges)
        profile.expertise = extracted_data.get("expertise", profile.expertise)
        profile.experience_years = extracted_data.get("experience_years", profile.experience_years)
        
        # Generate and store embeddings in a single JSON dictionary
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
        profile_updated = True
        
        # Generate initial matches for the user
        generate_matches_for_user(current_user.id, db)
        
        response_text = "Thank you! I've successfully analyzed our conversation and created your professional matchmaking profile. We've already generated some initial matches for you. Click on 'Matches' or go to your Dashboard to view them!"

    # Save Assistant Message
    assistant_msg = ChatMessage(
        user_id=current_user.id,
        sender="assistant",
        message=response_text
    )
    db.add(assistant_msg)
    db.commit()
    
    return {
        "user_message": user_msg,
        "assistant_message": assistant_msg,
        "profile_extracted": profile_updated
    }
