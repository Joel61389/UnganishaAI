from datetime import datetime
import uuid
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    organization = Column(String(100), nullable=True)
    role = Column(String(50), nullable=False, default="Developer")  # Founder, Developer, Mentor, Investor, Professional
    location = Column(String(100), nullable=True)
    linkedin = Column(String(255), nullable=True)
    github = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    industry = Column(String(100), nullable=True)
    skills = Column(JSON, nullable=True, default=list)        # list of strings
    interests = Column(JSON, nullable=True, default=list)     # list of strings
    goals = Column(JSON, nullable=True, default=list)         # list of strings
    challenges = Column(JSON, nullable=True, default=list)    # list of strings
    expertise = Column(JSON, nullable=True, default=list)     # list of strings
    experience_years = Column(Integer, nullable=True, default=0)
    embedding = Column(JSON, nullable=True)                   # list of floats (embeddings)

    # Relationships
    user = relationship("User", back_populates="profile")

class Match(Base):
    __tablename__ = "matches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user1_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user2_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)
    reason = Column(JSON, nullable=True, default=list)        # list of strings
    status = Column(String(50), nullable=False, default="pending")  # pending, accepted, rejected, introduced
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user1 = relationship("User", foreign_keys=[user1_id])
    user2 = relationship("User", foreign_keys=[user2_id])
    introductions = relationship("Introduction", back_populates="match", cascade="all, delete-orphan")

class Introduction(Base):
    __tablename__ = "introductions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    match_id = Column(String(36), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    introduction_message = Column(Text, nullable=False)
    accepted = Column(Boolean, default=False)
    sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    match = relationship("Match", back_populates="introductions")
    feedbacks = relationship("Feedback", back_populates="introduction", cascade="all, delete-orphan")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    introduction_id = Column(String(36), ForeignKey("introductions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)                   # 1 to 5
    comments = Column(Text, nullable=True)
    would_collaborate = Column(Boolean, default=False)
    verified = Column(Boolean, default=False)                  # verify if the intro was genuinely useful
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    introduction = relationship("Introduction", back_populates="feedbacks")
    user = relationship("User", back_populates="feedbacks")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(20), nullable=False)                # "user" or "assistant"
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="chat_messages")
