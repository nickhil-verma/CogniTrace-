from app.config import settings
from app.services.storage.base import BaseStorageProvider
from app.services.storage.local_storage import LocalStorageProvider
from app.services.storage.s3_storage import S3StorageProvider


def get_storage_provider() -> BaseStorageProvider:
    provider_type = settings.STORAGE_PROVIDER.lower().strip()
    if provider_type == "s3":
        try:
            return S3StorageProvider()
        except Exception:
            return LocalStorageProvider()
    return LocalStorageProvider()


storage_provider = get_storage_provider()
