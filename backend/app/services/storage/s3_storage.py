import logging
from app.config import settings
from app.services.storage.base import BaseStorageProvider

logger = logging.getLogger("cognitrace.storage.s3")


class S3StorageProvider(BaseStorageProvider):
    def __init__(
        self,
        bucket_name: str = settings.S3_BUCKET_NAME,
        region_name: str = settings.AWS_REGION
    ):
        self.bucket_name = bucket_name
        self.region_name = region_name
        self.s3_client = None

    def _get_client(self):
        if self.s3_client is None:
            import boto3
            self.s3_client = boto3.client("s3", region_name=self.region_name)
        return self.s3_client

    async def save_file(self, file_bytes: bytes, filename: str) -> str:
        try:
            client = self._get_client()
            client.put_object(
                Bucket=self.bucket_name,
                Key=filename,
                Body=file_bytes
            )
            return filename
        except Exception as e:
            logger.error(f"[S3Storage] Error uploading file to S3: {e}")
            raise RuntimeError(f"S3 upload failed: {str(e)}")

    async def get_file_url(self, file_key: str) -> str:
        try:
            client = self._get_client()
            url = client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": file_key},
                ExpiresIn=3600
            )
            return url
        except Exception as e:
            logger.error(f"[S3Storage] Error generating pre-signed URL: {e}")
            return f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{file_key}"

    async def read_file(self, file_key: str) -> bytes:
        try:
            client = self._get_client()
            response = client.get_object(Bucket=self.bucket_name, Key=file_key)
            return response["Body"].read()
        except Exception as e:
            logger.error(f"[S3Storage] Error reading file from S3: {e}")
            raise FileNotFoundError(f"File key '{file_key}' not found in S3 bucket.")
