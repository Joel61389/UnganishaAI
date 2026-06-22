import numpy as np
from ..models.models import User, UserProfile
from .embedding_service import get_embedding, cosine_similarity

def calculate_jaccard_similarity(list1: list, list2: list) -> float:
    if not list1 or not list2:
        return 0.0
    set1 = set([item.lower().strip() for item in list1])
    set2 = set([item.lower().strip() for item in list2])
    intersection = set1.intersection(set2)
    union = set1.union(set2)
    if not union:
        return 0.0
    return float(len(intersection) / len(union))

def get_location_similarity(loc1: str, loc2: str) -> float:
    if not loc1 or not loc2:
        return 0.0
    
    loc1_clean = loc1.lower().strip()
    loc2_clean = loc2.lower().strip()
    
    if loc1_clean == loc2_clean:
        return 1.0
        
    # Check if both are in Kenya/common Kenyan cities
    kenyan_cities = ["nairobi", "mombasa", "kisumu", "nakuru", "eldoret", "thika", "kenya"]
    is_loc1_kenya = any(city in loc1_clean for city in kenyan_cities)
    is_loc2_kenya = any(city in loc2_clean for city in kenyan_cities)
    
    if is_loc1_kenya and is_loc2_kenya:
        return 0.5
        
    return 0.0

def generate_match_reasons(user1: User, profile1: UserProfile, user2: User, profile2: UserProfile, 
                           skill_sim: float, goal_sim: float, interest_sim: float, loc_sim: float) -> list:
    reasons = []
    
    # 1. Skill reasons
    shared_skills = set([s.lower().strip() for s in (profile1.skills or [])]).intersection(
        set([s.lower().strip() for s in (profile2.skills or [])])
    )
    if shared_skills:
        skills_str = ", ".join([s.capitalize() for s in list(shared_skills)[:3]])
        reasons.append(f"Shared technical skills: {skills_str}")
    elif skill_sim > 0.6:
        reasons.append("Highly complementary technical profiles and skills")
        
    # 2. Role complementary
    role1 = user1.role.lower()
    role2 = user2.role.lower()
    if (role1 == "founder" and role2 == "developer") or (role1 == "developer" and role2 == "founder"):
        reasons.append("Complementary roles: Collaboration between Startup Founder and Software Developer")
    elif (role1 == "founder" and role2 == "mentor") or (role1 == "mentor" and role2 == "founder"):
        reasons.append("Complementary roles: Guidance opportunity between Startup Founder and Mentor")
    elif (role1 == "founder" and role2 == "investor") or (role1 == "investor" and role2 == "founder"):
        reasons.append("Investment match: Startup Founder and potential Investor")

    # 3. Interest reasons
    shared_interests = set([i.lower().strip() for i in (profile1.interests or [])]).intersection(
        set([i.lower().strip() for i in (profile2.interests or [])])
    )
    if shared_interests:
        interests_str = ", ".join([i.capitalize() for i in list(shared_interests)[:3]])
        reasons.append(f"Shared industry interests: {interests_str}")
        
    # 4. Goals and challenges
    # Check if user1 has a goal that matches user2's skills, or vice versa
    # E.g. user1 needs "React Developer" (in goals/challenges) and user2 has "React" skill
    profile1_goals_text = " ".join(profile1.goals or []) + " " + " ".join(profile1.challenges or [])
    profile2_goals_text = " ".join(profile2.goals or []) + " " + " ".join(profile2.challenges or [])
    
    match_found = False
    for skill in (profile2.skills or []):
        if skill.lower() in profile1_goals_text.lower():
            reasons.append(f"{user1.name} is looking for expertise in {skill}, which {user2.name} possesses")
            match_found = True
            break
            
    if not match_found:
        for skill in (profile1.skills or []):
            if skill.lower() in profile2_goals_text.lower():
                reasons.append(f"{user2.name} is looking for expertise in {skill}, which {user1.name} possesses")
                break

    if goal_sim > 0.7:
        reasons.append("Highly aligned professional goals and startup objectives")

    # 5. Location reasons
    if loc_sim == 1.0:
        reasons.append(f"Both based in the same location: {user1.location or user2.location}")
    elif loc_sim == 0.5:
        reasons.append("Both based in the Kenyan startup ecosystem, enabling local collaborations")

    # Ensure we always return at least two good reasons
    if len(reasons) < 2:
        reasons.append("Highly compatible networking profiles")
        reasons.append("Mutual opportunity to collaborate and share connections")

    return reasons

def calculate_match_score(user1: User, profile1: UserProfile, user2: User, profile2: UserProfile) -> dict:
    """
    Computes matching score between user1 and user2.
    Formula:
    Match Score = 0.40 * Skill Similarity + 0.30 * Goal Compatibility + 0.20 * Interest Similarity + 0.10 * Location Similarity
    """
    # 1. Skills Cosine Similarity
    emb1 = profile1.embedding or {}
    emb2 = profile2.embedding or {}
    
    v_skills1 = emb1.get("skills")
    v_skills2 = emb2.get("skills")
    
    # If embedding not saved, generate on the fly
    if not v_skills1 and profile1.skills:
        v_skills1 = get_embedding(", ".join(profile1.skills))
    if not v_skills2 and profile2.skills:
        v_skills2 = get_embedding(", ".join(profile2.skills))
        
    skill_sim = cosine_similarity(v_skills1, v_skills2) if v_skills1 and v_skills2 else 0.0
    
    # 2. Goals Cosine Similarity (Goal Compatibility)
    v_goals1 = emb1.get("goals")
    v_goals2 = emb2.get("goals")
    
    if not v_goals1 and (profile1.goals or profile1.challenges):
        text = ", ".join((profile1.goals or []) + (profile1.challenges or []))
        v_goals1 = get_embedding(text)
    if not v_goals2 and (profile2.goals or profile2.challenges):
        text = ", ".join((profile2.goals or []) + (profile2.challenges or []))
        v_goals2 = get_embedding(text)
        
    goal_sim = cosine_similarity(v_goals1, v_goals2) if v_goals1 and v_goals2 else 0.0
    
    # 3. Interests Similarity (Jaccard)
    interest_sim = calculate_jaccard_similarity(profile1.interests, profile2.interests)
    
    # 4. Location Similarity (Geographical or Boolean)
    loc_sim = get_location_similarity(user1.location, user2.location)
    
    # Calculate final score
    final_score = (0.40 * skill_sim) + (0.30 * goal_sim) + (0.20 * interest_sim) + (0.10 * loc_sim)
    
    # Scale score to a percentage (0-100)
    score_percentage = round(final_score * 100, 1)
    
    # Limit to valid bounds
    score_percentage = max(0.0, min(100.0, score_percentage))
    
    # Generate reasons
    reasons = generate_match_reasons(
        user1, profile1, user2, profile2, 
        skill_sim, goal_sim, interest_sim, loc_sim
    )
    
    return {
        "score": score_percentage,
        "reasons": reasons
    }
