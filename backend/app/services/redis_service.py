import time
import uuid
import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger("cognitrace.redis")

# In-Memory Fallbacks for offline local dev / tests
IN_MEMORY_LOCKS = {}
IN_MEMORY_RATE_LIMITS = {}


class RedisService:
    def __init__(self):
        self.redis = None

    async def init_redis(self):
        try:
            import redis.asyncio as aioredis
            self.redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            await self.redis.ping()
            logger.info("[Redis] Redis connection established.")
        except Exception as e:
            logger.warning(f"[Redis] Redis connection warning (running in-memory fallback mode): {e}")
            self.redis = None

    async def close_redis(self):
        if self.redis:
            try:
                await self.redis.close()
            except Exception:
                pass
            self.redis = None

    async def check_health(self) -> bool:
        if not self.redis:
            return False
        try:
            return await self.redis.ping()
        except Exception:
            return False

    async def acquire_lock(self, resource_key: str, ttl_seconds: int = 5) -> Optional[str]:
        """
        Acquires a distributed lock for a resource key (SET key val NX EX ttl).
        Returns lock token if acquired, None otherwise.
        """
        lock_token = str(uuid.uuid4())
        if self.redis:
            try:
                acquired = await self.redis.set(resource_key, lock_token, nx=True, ex=ttl_seconds)
                return lock_token if acquired else None
            except Exception as e:
                logger.warning(f"[Redis] acquire_lock fallback: {e}")

        # In-memory fallback lock logic
        now = time.time()
        existing = IN_MEMORY_LOCKS.get(resource_key)
        if existing and existing["expires_at"] > now:
            return None
        
        IN_MEMORY_LOCKS[resource_key] = {"token": lock_token, "expires_at": now + ttl_seconds}
        return lock_token

    async def release_lock(self, resource_key: str, lock_token: str) -> bool:
        """
        Releases lock if token matches.
        """
        if self.redis:
            try:
                lua_script = """
                if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("del", KEYS[1])
                else
                    return 0
                end
                """
                res = await self.redis.eval(lua_script, 1, resource_key, lock_token)
                return res == 1
            except Exception as e:
                logger.warning(f"[Redis] release_lock fallback: {e}")

        # In-memory fallback
        existing = IN_MEMORY_LOCKS.get(resource_key)
        if existing and existing["token"] == lock_token:
            del IN_MEMORY_LOCKS[resource_key]
            return True
        return False

    async def check_sliding_rate_limit(self, user_id: str, action: str, window_seconds: int = 1800, max_requests: int = 1) -> bool:
        """
        Sliding-window rate limiter. Returns True if request is ALLOWED, False if RATE LIMITED.
        Default window_seconds = 1800 (30 minutes).
        """
        key = f"rate_limit:{action}:{user_id}"
        now = time.time()
        window_start = now - window_seconds

        if self.redis:
            try:
                pipe = self.redis.pipeline()
                pipe.zremrangebyscore(key, 0, window_start)
                pipe.zcard(key)
                pipe.zadd(key, {str(now): now})
                pipe.expire(key, window_seconds)
                results = await pipe.execute()
                current_count = results[1]
                return current_count < max_requests
            except Exception as e:
                logger.warning(f"[Redis] rate limit fallback: {e}")

        # In-memory fallback
        timestamps = IN_MEMORY_RATE_LIMITS.get(key, [])
        valid_timestamps = [t for t in timestamps if t > window_start]
        if len(valid_timestamps) >= max_requests:
            IN_MEMORY_RATE_LIMITS[key] = valid_timestamps
            return False
        
        valid_timestamps.append(now)
        IN_MEMORY_RATE_LIMITS[key] = valid_timestamps
        return True


redis_service = RedisService()
