from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

def get_async_db_url(raw_url: str) -> str:
    if not raw_url:
        return f"sqlite+aiosqlite:///{BASE_DIR / 'db.sqlite3'}"

    # Handle PostgreSQL URL for asyncpg
    if raw_url.startswith("postgresql://") or raw_url.startswith("postgres://"):
        parsed = urlparse(raw_url)
        query_params = parse_qs(parsed.query)

        # asyncpg uses 'ssl' instead of 'sslmode'
        ssl_val = query_params.pop('sslmode', [None])[0]
        if ssl_val and 'ssl' not in query_params:
            query_params['ssl'] = ['require' if ssl_val in ('require', 'prefer') else ssl_val]

        # remove channel_binding if present (asyncpg doesn't take channel_binding parameter in url)
        query_params.pop('channel_binding', None)

        new_query = urlencode(query_params, doseq=True)
        new_url = urlunparse((
            "postgresql+asyncpg",
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment
        ))
        return new_url

    if raw_url.startswith("sqlite:///"):
        return raw_url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)

    return raw_url

db_url = get_async_db_url(settings.DATABASE_URL)

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    pool_pre_ping=True if "postgresql" in db_url else False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
