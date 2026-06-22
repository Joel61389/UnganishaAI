import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load env variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback to SQLite if DATABASE_URL is not provided
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./unganisha.db"

# Set up engine arguments
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_db_connection():
    """
    Tries to connect to the database. If it fails and it was configured for postgres,
    falls back to SQLite and updates the global engine and SessionLocal.
    """
    global engine, SessionLocal, DATABASE_URL
    try:
        # Try to connect
        with engine.connect() as conn:
            conn.execute(Base.metadata.schema_value_class() if hasattr(Base.metadata, "schema_value_class") else "SELECT 1")
    except Exception as e:
        if not DATABASE_URL.startswith("sqlite"):
            print(f"PostgreSQL connection failed: {e}. Falling back to SQLite.")
            DATABASE_URL = "sqlite:///./unganisha.db"
            engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
