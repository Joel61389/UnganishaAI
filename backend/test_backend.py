import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, Base, engine
from app.models.models import User, UserProfile, Match, Introduction, Feedback
from app.services.profile_extractor import extract_profile
from app.services.embedding_service import get_embedding, cosine_similarity
from app.services.match_engine import calculate_match_score
from app.services.recommendation_service import generate_matches_for_user, get_user_matches
from app.services.introduction_service import generate_introduction
from app.services.feedback_service import submit_feedback, get_feedback_stats

def run_tests():
    print("=== STARTING INTEGRATION TESTS ===")
    
    # 1. Initialize SQLite database for testing (fresh schema every run)
    print("\n1. Initializing database...")
    Base.metadata.drop_all(bind=engine)   # ensure clean slate with current model schema
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Clean previous records
    db.query(Feedback).delete()
    db.query(Introduction).delete()
    db.query(Match).delete()
    db.query(UserProfile).delete()
    db.query(User).delete()
    db.commit()
    print("Database cleared and schema created.")

    # 2. Test Profile Extraction (rule-based fallback)
    print("\n2. Testing profile extraction fallback...")
    founder_chat = "I am a founder. I am building a fintech startup in Nairobi. I need a react developer and an AI engineer. We are scaling fast."
    dev_chat = "I am a software developer based in Nairobi. I have 4 years of experience with React, javascript, python and fastapi. I am looking for co-founder opportunities in fintech startup ecosystem."
    
    founder_profile = extract_profile(founder_chat, default_role="Founder")
    dev_profile = extract_profile(dev_chat, default_role="Developer")
    
    print(f"Extracted Founder Profile: {founder_profile['role']}, Skills: {founder_profile['skills']}, Goals: {founder_profile['goals']}")
    print(f"Extracted Developer Profile: {dev_profile['role']}, Skills: {dev_profile['skills']}, Goals: {dev_profile['goals']}")
    
    assert founder_profile['role'] == "Founder"
    assert dev_profile['role'] == "Developer"
    assert "React" in dev_profile['skills'] or "Software Development" in dev_profile['skills']

    # 3. Create Users
    print("\n3. Inserting test users into database...")
    user1 = User(
        name="Test Founder",
        email="founder@test.com",
        password_hash="hashed_password",
        role="Founder",
        location="Nairobi",
        wallet_address="0x1111111111111111111111111111111111111111"
    )
    user2 = User(
        name="Test Developer",
        email="developer@test.com",
        password_hash="hashed_password",
        role="Developer",
        location="Nairobi",
        wallet_address="0x2222222222222222222222222222222222222222"
    )
    db.add(user1)
    db.add(user2)
    db.commit()
    db.refresh(user1)
    db.refresh(user2)
    
    # 4. Create User Profiles
    profile1 = UserProfile(
        user_id=user1.id,
        bio=founder_profile['bio'],
        industry=founder_profile['industry'],
        skills=founder_profile['skills'],
        interests=founder_profile['interests'],
        goals=founder_profile['goals'],
        challenges=founder_profile['challenges'],
        experience_years=founder_profile['experience_years']
    )
    profile2 = UserProfile(
        user_id=user2.id,
        bio=dev_profile['bio'],
        industry=dev_profile['industry'],
        skills=dev_profile['skills'],
        interests=dev_profile['interests'],
        goals=dev_profile['goals'],
        challenges=dev_profile['challenges'],
        experience_years=dev_profile['experience_years']
    )
    db.add(profile1)
    db.add(profile2)
    db.commit()
    
    # 5. Generate and store embeddings
    print("\n5. Generating mock embeddings...")
    p1_skills_text = ", ".join(profile1.skills)
    p1_goals_text = ", ".join(profile1.goals + profile1.challenges)
    profile1.embedding = {
        "skills": get_embedding(p1_skills_text),
        "goals": get_embedding(p1_goals_text)
    }
    
    p2_skills_text = ", ".join(profile2.skills)
    p2_goals_text = ", ".join(profile2.goals + profile2.challenges)
    profile2.embedding = {
        "skills": get_embedding(p2_skills_text),
        "goals": get_embedding(p2_goals_text)
    }
    db.add(profile1)
    db.add(profile2)
    db.commit()

    # 6. Test Match Engine Score
    print("\n6. Calculating Match Score...")
    match_result = calculate_match_score(user1, profile1, user2, profile2)
    print(f"Match Score: {match_result['score']}%")
    print(f"Match Reasons: {match_result['reasons']}")
    
    assert match_result['score'] > 0.0
    assert len(match_result['reasons']) > 0

    # 7. Test Match Generation
    print("\n7. Generating Matches in Database...")
    generate_matches_for_user(user1.id, db)
    matches = get_user_matches(user1.id, db)
    print(f"Matches count for founder: {len(matches)}")
    assert len(matches) > 0
    match_record_id = matches[0]["id"]
    
    # 8. Test Introduction Generation
    print("\n8. Generating Introduction...")
    # Fetch Match model
    match_model = db.query(Match).filter(Match.id == match_record_id).first()
    intro_msg = generate_introduction(user1, profile1, user2, profile2, match_model.score, match_model.reason)
    print("Generated Intro:")
    print(intro_msg)
    assert "Test Founder" in intro_msg
    assert "Test Developer" in intro_msg
    
    # Save introduction
    intro = Introduction(
        match_id=match_model.id,
        introduction_message=intro_msg,
        accepted=False,
        sent=True,
        payment_status="escrowed",
        payment_tx_hash="0xmock_fuji_tx_hash_for_testing"
    )
    match_model.status = "introduced"
    db.add(intro)           # persist the introduction
    db.add(match_model)
    db.commit()
    db.refresh(intro)
    
    # 9. Test Feedback Submission
    print("\n9. Testing Feedback system...")
    fb1 = submit_feedback(
        user_id=user1.id,
        intro_id=intro.id,
        rating=5,
        comments="Great match! We have scheduled a call.",
        would_collaborate=True,
        verified=True,
        db=db
    )
    fb2 = submit_feedback(
        user_id=user2.id,
        intro_id=intro.id,
        rating=4,
        comments="Excited to work with this startup.",
        would_collaborate=True,
        verified=True,
        db=db
    )
    print(f"Feedback 1: Rating={fb1.rating}, Verified={fb1.verified}")
    print(f"Feedback 2: Rating={fb2.rating}, Verified={fb2.verified}")
    
    # Reload intro to check if it got accepted
    db.refresh(intro)
    print(f"Introduction Accepted/Verified: {intro.accepted}")
    assert intro.accepted == True
    print(f"Introduction Payment Status: {intro.payment_status}")
    assert intro.payment_status == "released"

    # 10. Test Feedback Stats
    stats = get_feedback_stats(db)
    print(f"Stats: {stats}")
    assert stats["total_feedbacks"] == 2
    assert stats["average_rating"] == 4.5
    assert stats["verification_rate"] == 100.0

    print("\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
