import os
import sys
import uuid
from datetime import datetime

# Setup path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine
from app.models.models import User, UserProfile, Match, Introduction, Base
from app.auth.auth_handler import hash_password

def seed_db():
    print("Connecting to database...")
    db = SessionLocal()
    
    # Optionally, we could drop all tables and recreate them if we want a clean slate
    print("Recreating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    print("Seeding users...")
    
    users_data = [
        {
            "name": "Amani K.",
            "email": "amani@unganisha.local",
            "password": "Password123!",
            "role": "Founder",
            "organization": "KilimoTech Hub",
            "location": "Nairobi, Kenya",
            "profile": {
                "bio": "Building an agritech platform connecting rural farmers to urban markets. Looking for technical co-founders and early-stage seed funding.",
                "industry": "Agritech",
                "skills": ["Product Strategy", "Agriculture", "B2B Sales"],
                "interests": ["Sustainable Farming", "Fintech Integration", "Supply Chain"],
                "goals": ["Find a CTO", "Raise $50k Seed"],
                "challenges": ["Technical execution", "Finding right investors"],
                "expertise": ["Market Research", "Operations"],
                "experience_years": 4,
                "embedding": [0.1, 0.2, 0.3, 0.4] # Mock vector
            }
        },
        {
            "name": "Kibwe Ventures",
            "email": "kibwe@invest.local",
            "password": "Password123!",
            "role": "Investor",
            "organization": "Savannah Seed Partners",
            "location": "Nairobi, Kenya",
            "profile": {
                "bio": "Angel investor looking to fund pre-seed and seed stage startups in Agritech, Fintech, and Healthtech across East Africa.",
                "industry": "Venture Capital",
                "skills": ["Due Diligence", "Financial Modeling", "Mentorship"],
                "interests": ["Agritech", "Fintech", "Impact Investing"],
                "goals": ["Deploy $200k this year", "Support 5 new startups"],
                "challenges": ["Deal flow quality", "Post-investment support bandwidth"],
                "expertise": ["Fundraising", "Corporate Governance"],
                "experience_years": 12,
                "embedding": [0.1, 0.25, 0.35, 0.4] # Close to Amani
            }
        },
        {
            "name": "Nia M.",
            "email": "nia@dev.local",
            "password": "Password123!",
            "role": "Developer",
            "organization": "Freelance",
            "location": "Mombasa, Kenya",
            "profile": {
                "bio": "Senior Full-Stack Developer specializing in React, Node, and Python. Interested in joining an early-stage startup as a founding engineer or CTO.",
                "industry": "Software Engineering",
                "skills": ["React", "Python", "FastAPI", "PostgreSQL", "AWS"],
                "interests": ["Agritech", "EdTech", "Open Source"],
                "goals": ["Join a promising startup", "Lead a technical team"],
                "challenges": ["Finding mission-driven founders", "Equity negotiation"],
                "expertise": ["System Architecture", "Frontend Development"],
                "experience_years": 7,
                "embedding": [0.12, 0.22, 0.3, 0.45] # Close to Amani
            }
        },
        {
            "name": "Faraji O.",
            "email": "faraji@mentor.local",
            "password": "Password123!",
            "role": "Mentor",
            "organization": "TechHub Africa",
            "location": "Kigali, Rwanda",
            "profile": {
                "bio": "Go-to-market specialist helping technical founders launch and scale their products. Currently advising 3 startups.",
                "industry": "Consulting",
                "skills": ["Go-to-Market Strategy", "Marketing", "Growth Hacking"],
                "interests": ["SaaS", "B2B", "African Tech Ecosystem"],
                "goals": ["Mentor 10 startups", "Write a book on African Tech"],
                "challenges": ["Time management"],
                "expertise": ["Marketing", "Sales Funnels"],
                "experience_years": 15,
                "embedding": [0.5, 0.1, 0.2, 0.8]
            }
        },
        {
            "name": "Juma S.",
            "email": "juma@web3.local",
            "password": "Password123!",
            "role": "Developer",
            "organization": "CryptoLabs",
            "location": "Nairobi, Kenya",
            "profile": {
                "bio": "Blockchain developer building smart contracts and DeFi protocols. Looking for Web3 projects.",
                "industry": "Web3",
                "skills": ["Solidity", "Rust", "Ethereum", "Smart Contracts"],
                "interests": ["DeFi", "DAOs", "Tokenomics"],
                "goals": ["Launch a protocol"],
                "challenges": ["Regulatory uncertainty"],
                "expertise": ["Cryptography", "Smart Contract Auditing"],
                "experience_years": 5,
                "embedding": [0.9, 0.8, 0.1, 0.2] # Far from Amani
            }
        }
    ]
    
    db_users = {}
    
    for u_data in users_data:
        # Create user
        user = User(
            id=str(uuid.uuid4()),
            name=u_data["name"],
            email=u_data["email"],
            password_hash=hash_password(u_data["password"]),
            role=u_data["role"],
            organization=u_data["organization"],
            location=u_data["location"]
        )
        db.add(user)
        db.flush()
        
        # Create profile
        p_data = u_data["profile"]
        profile = UserProfile(
            id=str(uuid.uuid4()),
            user_id=user.id,
            bio=p_data["bio"],
            industry=p_data["industry"],
            skills=p_data["skills"],
            interests=p_data["interests"],
            goals=p_data["goals"],
            challenges=p_data["challenges"],
            expertise=p_data["expertise"],
            experience_years=p_data["experience_years"],
            embedding=p_data["embedding"]
        )
        db.add(profile)
        db_users[u_data["name"]] = user
        
    db.commit()
    print("Users seeded!")
    
    print("Seeding matches & connections...")
    amani = db_users["Amani K."]
    kibwe = db_users["Kibwe Ventures"]
    nia = db_users["Nia M."]
    faraji = db_users["Faraji O."]
    juma = db_users["Juma S."]
    
    # Amani & Kibwe (Founder + Investor)
    m1 = Match(
        id=str(uuid.uuid4()),
        user1_id=amani.id,
        user2_id=kibwe.id,
        score=92.5,
        reason=["Both interested in Agritech", "Amani is seeking seed funding, Kibwe invests in seed stage", "Aligned locations"],
        status="accepted"
    )
    
    # Amani & Nia (Founder + Dev)
    m2 = Match(
        id=str(uuid.uuid4()),
        user1_id=amani.id,
        user2_id=nia.id,
        score=88.0,
        reason=["Amani needs a CTO, Nia wants to join a startup", "Complementary skills (Operations vs Technical)", "Both interested in Agritech"],
        status="pending"
    )
    
    # Amani & Faraji (Founder + Mentor)
    m3 = Match(
        id=str(uuid.uuid4()),
        user1_id=amani.id,
        user2_id=faraji.id,
        score=75.4,
        reason=["Faraji provides GTM strategy which Amani will need for scaling"],
        status="introduced"
    )
    
    # Amani & Juma (Low match)
    m4 = Match(
        id=str(uuid.uuid4()),
        user1_id=amani.id,
        user2_id=juma.id,
        score=24.1,
        reason=["Different industries (Agritech vs Web3)", "Misaligned goals"],
        status="rejected"
    )
    
    db.add_all([m1, m2, m3, m4])
    db.commit()
    
    # Create an Introduction for the 'introduced' match
    intro = Introduction(
        id=str(uuid.uuid4()),
        match_id=m3.id,
        introduction_message="Hi Amani and Faraji, I think you two should connect. Amani is building an Agritech platform and Faraji's GTM expertise could be very valuable for the launch phase.",
        accepted=True,
        sent=True,
        payment_status="escrowed"
    )
    db.add(intro)
    db.commit()
    
    print("Database seeding completed successfully!")
    print("\n--- Seeded Users ---")
    for u in users_data:
        print(f"Name: {u['name']} | Role: {u['role']} | Email: {u['email']} | Password: {u['password']}")
    print("--------------------")
    
if __name__ == "__main__":
    seed_db()
