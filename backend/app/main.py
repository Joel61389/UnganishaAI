import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database.session import engine, Base, check_db_connection, SessionLocal
from .models.models import User, UserProfile
from .auth.auth_handler import hash_password
from .services.embedding_service import get_embedding
from .services.recommendation_service import generate_matches_for_user

# Import routers
from .api import auth, chat, profile, matches, introductions, feedback, analytics

app = FastAPI(
    title="Unganisha AI API",
    description="Conversational Matchmaking and Introduction Platform for the Kenyan Startup Ecosystem",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development ease, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(profile.router)
app.include_router(matches.router)
app.include_router(introductions.router)
app.include_router(feedback.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Unganisha AI API. The matchmaking engine is running!"}

def seed_data(db: Session):
    """
    Seeds initial users and profiles to ensure immediate runnability and testability.
    """
    if db.query(User).count() > 0:
        return
        
    print("Database is empty. Seeding initial startup ecosystem users...")
    
    # 1. Sam Kiprop (Founder)
    sam = User(
        name="Sam Kiprop",
        email="sam@agripay.co.ke",
        password_hash=hash_password("password123"),
        phone="+254711223344",
        organization="AgriPay",
        role="Founder",
        location="Nairobi",
        linkedin="https://linkedin.com/in/sam-kiprop-example",
        github="https://github.com/sam-agripay"
    )
    db.add(sam)
    db.flush()
    
    sam_profile = UserProfile(
        user_id=sam.id,
        bio="Building AgriPay, a fintech platform supporting smallholder farmers in Kenya with crop financing and micro-insurance.",
        industry="AgriTech",
        skills=["Business Development", "Product Strategy", "Fundraising"],
        interests=["AgriTech", "FinTech", "Artificial Intelligence"],
        goals=["Find Technical Co-Founder", "Hire Developers", "Find Funding"],
        challenges=["Need software development help", "Need fundraising support"],
        expertise=["Business strategy", "Operations"],
        experience_years=5
    )
    db.add(sam_profile)

    # 2. Amani Mwangi (Developer)
    amani = User(
        name="Amani Mwangi",
        email="amani@dev.ke",
        password_hash=hash_password("password123"),
        phone="+254722334455",
        organization="Freelance",
        role="Developer",
        location="Nairobi",
        linkedin="https://linkedin.com/in/amani-mwangi-example",
        github="https://github.com/amani-codes"
    )
    db.add(amani)
    db.flush()
    
    amani_profile = UserProfile(
        user_id=amani.id,
        bio="Front-end engineer passionate about pixel-perfect mobile-responsive UI. Seeking co-founder opportunities in FinTech.",
        industry="FinTech",
        skills=["React", "UI/UX Design", "JavaScript", "Tailwind CSS"],
        interests=["FinTech", "Mobile Development", "E-commerce"],
        goals=["Find Projects/Jobs", "Find Technical Co-Founder"],
        challenges=["Customer Acquisition", "Lack of business support"],
        expertise=["Frontend engineering", "UI Design"],
        experience_years=3
    )
    db.add(amani_profile)

    # 3. Fatuma Ali (Developer / AI Engineer)
    fatuma = User(
        name="Fatuma Ali",
        email="fatuma@ai.ke",
        password_hash=hash_password("password123"),
        phone="+254733445566",
        organization="MiniHack Community",
        role="Developer",
        location="Nairobi",
        linkedin="https://linkedin.com/in/fatuma-ali-example",
        github="https://github.com/fatuma-ai"
    )
    db.add(fatuma)
    db.flush()
    
    fatuma_profile = UserProfile(
        user_id=fatuma.id,
        bio="AI Engineer specializing in NLP, predictive analytics, and building LLM chatbots. Interested in applying AI to agriculture.",
        industry="Artificial Intelligence",
        skills=["Python", "Artificial Intelligence", "FastAPI", "PostgreSQL"],
        interests=["Artificial Intelligence", "AgriTech", "Climate Tech"],
        goals=["Find Technical Co-Founder", "Find Mentorship"],
        challenges=["Fundraising Difficulties", "Product Market Fit"],
        expertise=["Data science", "Backend engineering"],
        experience_years=4
    )
    db.add(fatuma_profile)

    # 4. David Ochieng (Mentor)
    david = User(
        name="David Ochieng",
        email="david@mentor.ke",
        password_hash=hash_password("password123"),
        phone="+254744556677",
        organization="Kuzana Accelerator",
        role="Mentor",
        location="Mombasa",
        linkedin="https://linkedin.com/in/david-ochieng-example",
        github="https://github.com/david-mentor"
    )
    db.add(david)
    db.flush()
    
    david_profile = UserProfile(
        user_id=david.id,
        bio="Ex-Founder who successfully scaled a logistics tech platform in East Africa. Mentoring pre-seed startups in operations and scaling.",
        industry="Logistics",
        skills=["Product Strategy", "Operations", "Team Management"],
        interests=["Logistics", "FinTech", "EdTech"],
        goals=["Find Mentorship", "Networking"],
        challenges=["None"],
        expertise=["Scaling business", "Logistics ops"],
        experience_years=12
    )
    db.add(david_profile)

    # 5. Lisa Wangari (Investor)
    lisa = User(
        name="Lisa Wangari",
        email="lisa@savannah.vc",
        password_hash=hash_password("password123"),
        phone="+254755667788",
        organization="Savannah Ventures",
        role="Investor",
        location="Nairobi",
        linkedin="https://linkedin.com/in/lisa-wangari-example",
        github="https://github.com/lisa-invests"
    )
    db.add(lisa)
    db.flush()
    
    lisa_profile = UserProfile(
        user_id=lisa.id,
        bio="Venture capitalist investing in early-stage fintech, agritech, and mobile startups in Sub-Saharan Africa.",
        industry="Venture Capital",
        skills=["Fundraising", "Product Strategy", "Financial Modeling"],
        interests=["FinTech", "AgriTech", "Mobile Development"],
        goals=["Find Funding", "Networking"],
        challenges=["None"],
        expertise=["Financial investments", "Growth metrics"],
        experience_years=8
    )
    db.add(lisa_profile)
    
    db.commit()
    
    # 6. Generate embeddings for seeded profiles
    all_profiles = [sam_profile, amani_profile, fatuma_profile, david_profile, lisa_profile]
    for p in all_profiles:
        skills_text = ", ".join(p.skills) if p.skills else ""
        goals_text = ", ".join((p.goals or []) + (p.challenges or []))
        
        skills_emb = get_embedding(skills_text) if skills_text else []
        goals_emb = get_embedding(goals_text) if goals_text else []
        
        p.embedding = {
            "skills": skills_emb,
            "goals": goals_emb
        }
        db.add(p)
    db.commit()
    
    # 7. Generate initial matches between seeded profiles
    generate_matches_for_user(sam.id, db)
    generate_matches_for_user(amani.id, db)
    generate_matches_for_user(fatuma.id, db)
    generate_matches_for_user(david.id, db)
    generate_matches_for_user(lisa.id, db)
    
    print("Seed complete! Added 5 users, created profiles, computed embeddings, and generated initial matches.")

@app.on_event("startup")
def startup_event():
    # Verify and establish DB connection
    check_db_connection()
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Seed data
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
