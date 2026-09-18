import os
import anyio
from app.config import settings
from app.services.storage.base import BaseStorageProvider


class LocalStorageProvider(BaseStorageProvider):
    def __init__(self, base_dir: str = settings.LOCAL_STORAGE_DIR):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def _save_file_sync(self, file_bytes: bytes, filename: str) -> str:
        filepath = os.path.join(self.base_dir, filename)
        with open(filepath, "wb") as f:
            f.write(file_bytes)
        return filename

    def _read_file_sync(self, file_key: str) -> bytes:
        filepath = os.path.join(self.base_dir, file_key)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File key '{file_key}' not found in local storage.")
        with open(filepath, "rb") as f:
            return f.read()

    async def save_file(self, file_bytes: bytes, filename: str) -> str:
        return await anyio.to_thread.run_sync(self._save_file_sync, file_bytes, filename)

    async def get_file_url(self, file_key: str) -> str:
        return f"/static/uploads/{file_key}"

    async def read_file(self, file_key: str) -> bytes:
        return await anyio.to_thread.run_sync(self._read_file_sync, file_key)
