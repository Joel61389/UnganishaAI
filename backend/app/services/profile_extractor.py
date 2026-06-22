import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Predefined keywords for local rule-based fallback
ROLE_KEYWORDS = {
    "founder": ["founder", "co-founder", "cofounder", "build startup", "start up", "ceo", "product owner"],
    "developer": ["developer", "engineer", "coder", "programmer", "software", "tech", "cto", "architect"],
    "mentor": ["mentor", "guide", "coach", "advisor", "advising", "experience leader"],
    "investor": ["investor", "venture", "vc", "angel", "funding", "funding startup"],
    "professional": ["freelancer", "consultant", "marketer", "designer", "sales", "operations"]
}

SKILL_KEYWORDS = {
    "React": ["react", "react.js", "reactjs", "next.js", "nextjs", "frontend", "front-end"],
    "Python": ["python", "django", "flask", "fastapi"],
    "Artificial Intelligence": ["ai", "artificial intelligence", "machine learning", "ml", "nlp", "llm", "openai", "deep learning"],
    "Product Management": ["product management", "pm", "product strategy", "agile", "scrum"],
    "UI/UX Design": ["ui", "ux", "design", "figma", "wireframing"],
    "PostgreSQL": ["postgres", "postgresql", "sql", "database"],
    "Cloud Computing": ["aws", "cloud", "docker", "kubernetes", "gcp", "azure"],
    "Business Development": ["sales", "business development", "marketing", "growth"],
    "Mobile Development": ["flutter", "react native", "android", "ios", "swift", "kotlin"]
}

INDUSTRY_KEYWORDS = {
    "FinTech": ["fintech", "finance", "payment", "banking", "lending", "inclusion"],
    "AgriTech": ["agritech", "agriculture", "farming", "crop", "farm"],
    "EdTech": ["edtech", "education", "learning", "school", "course"],
    "Climate Tech": ["climate", "sustainability", "energy", "solar", "green"],
    "HealthTech": ["healthtech", "health", "medical", "telemedicine"],
    "Web3": ["web3", "crypto", "blockchain", "ethereum", "solana"]
}

GOAL_KEYWORDS = {
    "Find Technical Co-Founder": ["co-founder", "technical cofounder", "cto", "partner"],
    "Find Funding": ["funding", "raise money", "fundraising", "capital", "investor"],
    "Find Mentorship": ["mentor", "guidance", "advisor", "learn"],
    "Find Projects/Jobs": ["job", "project", "work", "gig", "contract"],
    "Hire Developers": ["hire developer", "looking for engineer", "recruit developers", "software help"],
    "Find Customers": ["customer", "client", "sales lead", "user acquisition"]
}

CHALLENGE_KEYWORDS = {
    "Lack of Technical Help": ["technical help", "software help", "developer help", "coding"],
    "Fundraising Difficulties": ["fundraising", "raising capital", "no money", "pre-seed"],
    "Customer Acquisition": ["marketing", "get customers", "sales", "distribution"],
    "Product Market Fit": ["pmf", "product market fit", "strategy", "validate"]
}

INTEREST_KEYWORDS = {
    "Artificial Intelligence": ["ai", "artificial intelligence", "ml", "llm"],
    "FinTech": ["fintech", "finance", "financial inclusion"],
    "AgriTech": ["agritech", "agriculture", "kenya farming"],
    "EdTech": ["edtech", "education"],
    "Climate Tech": ["climate", "carbon", "renewable"],
    "Web3": ["web3", "crypto", "blockchain"]
}

def extract_profile_with_openai(chat_history_text: str, client: OpenAI) -> dict:
    """
    Attempts to extract profile details using OpenAI API.
    """
    prompt = f"""
    You are an AI assistant that parses conversations from an onboarding chatbot to create structured professional profiles.
    Analyze the following chat history and extract the user's details.

    Chat History:
    {chat_history_text}

    Output a valid JSON object matching this structure exactly (do not include any markdown backticks, just raw JSON):
    {{
        "role": "Founder or Developer or Mentor or Investor or Professional",
        "bio": "A concise 1-2 sentence bio of the person",
        "industry": "Primary industry, e.g., FinTech, AgriTech, EdTech, Climate Tech, HealthTech, Web3, etc.",
        "skills": ["Skill 1", "Skill 2", ...],
        "interests": ["Interest 1", "Interest 2", ...],
        "goals": ["Goal 1", "Goal 2", ...],
        "challenges": ["Challenge 1", "Challenge 2", ...],
        "expertise": ["Area of Expertise 1", ...],
        "experience_years": 3
    }}
    """
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a precise data extractor that returns ONLY JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0
        )
        content = response.choices[0].message.content.strip()
        # Remove any potential markdown blocks
        if content.startswith("```"):
            content = re.sub(r"^```json\s*", "", content)
            content = re.sub(r"\s*```$", "", content)
        return json.loads(content)
    except Exception as e:
        print(f"OpenAI extraction failed: {e}. Using fallback system.")
        return None

def extract_profile_fallback(chat_history_text: str, default_role: str = "Developer") -> dict:
    """
    Local rule-based fallback if OpenAI is not available.
    """
    text_lower = chat_history_text.lower()
    
    # Extract Role
    role = default_role
    declared_role = None
    
    # 1. Try to find explicit role declarations (e.g., "i am a developer", "i'm a founder")
    for r, keywords in ROLE_KEYWORDS.items():
        for kw in keywords:
            pattern = rf"\b(?:i\s+am\s+(?:a\s+|an\s+)?|i'm\s+(?:a\s+|an\s+)?|i\s+work\s+as\s+(?:a\s+|an\s+)?)(?:[a-z\-]+\s+)?{re.escape(kw)}\b"
            if re.search(pattern, text_lower):
                declared_role = r.capitalize()
                break
        if declared_role:
            break
            
    # 2. If no explicit declaration, search keywords but ignore negative contexts (e.g. "looking for co-founder", "need a developer")
    if not declared_role:
        for r, keywords in ROLE_KEYWORDS.items():
            for kw in keywords:
                for match in re.finditer(rf"\b{re.escape(kw)}\b", text_lower):
                    start_idx = match.start()
                    context = text_lower[max(0, start_idx - 30):start_idx]
                    if any(neg in context for neg in ["need", "look for", "looking for", "hire", "find", "search", "seek"]):
                        continue
                    declared_role = r.capitalize()
                    break
                if declared_role:
                    break
            if declared_role:
                break
                
    if declared_role:
        role = declared_role
            
    # Extract Industry
    industry = "General"
    for ind, keywords in INDUSTRY_KEYWORDS.items():
        if any(keyword in text_lower for keyword in keywords):
            industry = ind
            break

    # Extract Skills
    skills = []
    for sk, keywords in SKILL_KEYWORDS.items():
        if any(keyword in text_lower for keyword in keywords):
            skills.append(sk)
            
    # Extract Interests
    interests = []
    for intr, keywords in INTEREST_KEYWORDS.items():
        if any(keyword in text_lower for keyword in keywords):
            interests.append(intr)
    if not interests:
        interests = [industry] if industry != "General" else ["Startups"]

    # Extract Goals
    goals = []
    for gl, keywords in GOAL_KEYWORDS.items():
        if any(keyword in text_lower for keyword in keywords):
            goals.append(gl)

    # Extract Challenges
    challenges = []
    for ch, keywords in CHALLENGE_KEYWORDS.items():
        if any(keyword in text_lower for keyword in keywords):
            challenges.append(ch)

    # Experience years estimation
    experience_years = 2
    years_match = re.search(r"(\d+)\s*years?", text_lower)
    if years_match:
        try:
            experience_years = int(years_match.group(1))
        except ValueError:
            pass

    # Basic Bio construction
    bio = f"A {role.lower()} active in the {industry} ecosystem."
    if skills:
        bio += f" Proficient in {', '.join(skills[:3])}."
    if goals:
        bio += f" Currently focused on: {', '.join(goals[:2])}."

    return {
        "role": role,
        "bio": bio,
        "industry": industry,
        "skills": skills if skills else ["Software Development"],
        "interests": interests,
        "goals": goals if goals else ["Networking"],
        "challenges": challenges if challenges else ["None"],
        "expertise": skills[:2] if skills else ["Technology"],
        "experience_years": experience_years
    }

def extract_profile(chat_history_text: str, default_role: str = "Developer") -> dict:
    """
    Main extraction interface. Tries OpenAI first, then falls back.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        client = OpenAI(api_key=api_key)
        profile_data = extract_profile_with_openai(chat_history_text, client)
        if profile_data:
            return profile_data
            
    return extract_profile_fallback(chat_history_text, default_role)
