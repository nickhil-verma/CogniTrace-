from abc import ABC, abstractmethod
from typing import Optional


class BaseStorageProvider(ABC):
    """
    Abstract storage adapter interface decoupled for AWS S3 and Local File Storage.
    """

    @abstractmethod
    async def save_file(self, file_bytes: bytes, filename: str) -> str:
        """
        Saves file bytes and returns file access key / path.
        """
        pass

    @abstractmethod
    async def get_file_url(self, file_key: str) -> str:
        """
        Returns streaming or pre-signed URL for the stored file key.
        """
        pass

    @abstractmethod
    async def read_file(self, file_key: str) -> bytes:
        """
        Reads raw file bytes from storage.
        """
        pass
