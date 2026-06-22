import os
from openai import OpenAI
from dotenv import load_dotenv
from ..models.models import User, UserProfile

load_dotenv()

def generate_introduction_with_openai(user1: User, profile1: UserProfile, 
                                     user2: User, profile2: UserProfile, 
                                     match_score: float, reasons: list, client: OpenAI) -> str:
    """
    Generate introduction using OpenAI GPT model.
    """
    prompt = f"""
    You are Unganisha AI, a professional matchmaker for the Kenyan startup ecosystem (MiniHack and Kuzana communities).
    Generate a warm, friendly, professional, specific, and actionable introduction message between the following two people:

    Person A:
    - Name: {user1.name}
    - Role: {user1.role}
    - Organization: {user1.organization or 'N/A'}
    - Location: {user1.location or 'Kenya'}
    - Industry: {profile1.industry or 'N/A'}
    - Skills: {', '.join(profile1.skills or [])}
    - Goals: {', '.join(profile1.goals or [])}
    - Challenges: {', '.join(profile1.challenges or [])}
    - Interests: {', '.join(profile1.interests or [])}
    - LinkedIn: {user1.linkedin or 'N/A'}

    Person B:
    - Name: {user2.name}
    - Role: {user2.role}
    - Organization: {user2.organization or 'N/A'}
    - Location: {user2.location or 'Kenya'}
    - Industry: {profile2.industry or 'N/A'}
    - Skills: {', '.join(profile2.skills or [])}
    - Goals: {', '.join(profile2.goals or [])}
    - Challenges: {', '.join(profile2.challenges or [])}
    - Interests: {', '.join(profile2.interests or [])}
    - LinkedIn: {user2.linkedin or 'N/A'}

    Match Score: {match_score}%
    Matching reasons: {'; '.join(reasons)}

    Structure the introduction to explain:
    1. A friendly greeting to both.
    2. Who each person is, their role, and their main focus.
    3. Why they were matched (highlighting mutual value, shared interests, skills and goals complementarity).
    4. Suggested actionable next steps (like checking their LinkedIn and hopping on a quick 15-minute call).
    
    Make it feel personalized, encouraging, and specific. Do not use generic placeholders.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional networking facilitator. Write a direct, warm introduction message."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI introduction generation failed: {e}. Using template fallback.")
        return None

def generate_introduction_fallback(user1: User, profile1: UserProfile, 
                                  user2: User, profile2: UserProfile, 
                                  match_score: float, reasons: list) -> str:
    """
    Generate introduction using a high-quality local template.
    """
    # Parse items to strings
    skills1 = ", ".join(profile1.skills or []) or "General Business"
    skills2 = ", ".join(profile2.skills or []) or "General Business"
    goals1 = ", ".join(profile1.goals or []) or "Networking"
    goals2 = ", ".join(profile2.goals or []) or "Networking"
    
    reasons_bullet = "\n".join([f"- {reason}" for reason in reasons])
    
    linkedin_part = ""
    if user1.linkedin or user2.linkedin:
        linkedin_part = "\nLinkedIn Profiles:\n"
        if user1.linkedin:
            linkedin_part += f"- {user1.name}: {user1.linkedin}\n"
        if user2.linkedin:
            linkedin_part += f"- {user2.name}: {user2.linkedin}\n"

    message = f"""Hi {user1.name} and {user2.name},

I would like to introduce you to each other.

{user1.name} is a {user1.role} in {profile1.industry or 'the startup ecosystem'}. {user1.name} brings skills in {skills1} and is currently focused on {goals1.lower()}.

{user2.name} is a {user2.role} in {profile2.industry or 'the startup ecosystem'}. {user2.name} brings skills in {skills2} and is currently focused on {goals2.lower()}.

Why you are matched (Match Score: {match_score}%):
{reasons_bullet}

Suggested Next Steps:
1. Reply to this thread to coordinate a brief 15-minute introductory call.
2. Review how your respective goals and skills can unlock new opportunities.{linkedin_part}
Wishing both of you a valuable collaboration!

Best regards,
Unganisha AI"""

    return message

def generate_introduction(user1: User, profile1: UserProfile, 
                          user2: User, profile2: UserProfile, 
                          match_score: float, reasons: list) -> str:
    """
    Main entry point for generating user introductions. Tries OpenAI first, falls back if needed.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        client = OpenAI(api_key=api_key)
        intro_msg = generate_introduction_with_openai(user1, profile1, user2, profile2, match_score, reasons, client)
        if intro_msg:
            return intro_msg
            
    return generate_introduction_fallback(user1, profile1, user2, profile2, match_score, reasons)
