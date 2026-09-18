import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger("cognitrace.database")

_pool = None


async def init_postgres_pool():
    global _pool
    try:
        from psycopg_pool import AsyncConnectionPool
        _pool = AsyncConnectionPool(
            conninfo=settings.POSTGRES_URI,
            max_size=settings.POSTGRES_MAX_POOL,
            open=False,
            kwargs={
                "options": "-c statement_timeout=10000",
                "autocommit": True
            }
        )
        await _pool.open(wait=False)
        logger.info("[Postgres] AsyncConnectionPool initialized successfully.")
    except Exception as e:
        logger.warning(f"[Postgres] AsyncConnectionPool warning (running degraded mode): {e}")
        _pool = None


async def close_postgres_pool():
    global _pool
    if _pool:
        try:
            await _pool.close()
            logger.info("[Postgres] AsyncConnectionPool closed.")
        except Exception as e:
            logger.warning(f"[Postgres] Error closing pool: {e}")
        _pool = None


async def check_postgres_health() -> bool:
    if not _pool:
        return False
    try:
        async with _pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT 1")
                result = await cur.fetchone()
                return result is not None and result[0] == 1
    except Exception:
        return False
