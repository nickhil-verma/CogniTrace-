import io
import numpy as np
import librosa
import soundfile as sf
from app.models.schemas import AcousticFeatures


class AcousticExtractor:
    def __init__(self, target_sr: int = 16000, top_db: float = 25.0):
        self.target_sr = target_sr
        self.top_db = top_db

    def process_audio_bytes(self, audio_bytes: bytes) -> tuple[np.ndarray, int]:
        """
        Loads raw audio bytes into a 16kHz mono numpy array using soundfile / librosa.
        """
        try:
            buffer = io.BytesIO(audio_bytes)
            y, sr = sf.read(buffer)
            if y.ndim > 1:
                y = np.mean(y, axis=1)  # Convert to mono
            if sr != self.target_sr:
                y = librosa.resample(y, orig_sr=sr, target_sr=self.target_sr)
                sr = self.target_sr
            return y.astype(np.float32), sr
        except Exception:
            # Fallback for synthetic / unreadable binary formats using librosa stream or raw PCM float fallback
            try:
                buffer = io.BytesIO(audio_bytes)
                y, sr = librosa.load(buffer, sr=self.target_sr, mono=True)
                return y.astype(np.float32), sr
            except Exception as e:
                raise ValueError(f"Failed to decode audio stream: {str(e)}")

    def extract_features(self, audio_bytes: bytes) -> AcousticFeatures:
        """
        Performs VAD, pause analysis, speech ratio calculation, and F0 jitter computation.
        """
        y, sr = self.process_audio_bytes(audio_bytes)
        total_samples = len(y)
        
        if total_samples == 0:
            return AcousticFeatures(
                speech_ratio=0.0,
                mean_pause_duration_ms=0.0,
                pause_count=0,
                jitter=0.0
            )

        # Voice Activity Detection (VAD) via librosa.effects.split
        voiced_intervals = librosa.effects.split(y, top_db=self.top_db)

        if len(voiced_intervals) == 0:
            return AcousticFeatures(
                speech_ratio=0.0,
                mean_pause_duration_ms=float(total_samples / sr * 1000.0),
                pause_count=1,
                jitter=0.0
            )

        # 1. Speech ratio: total voiced samples / total samples
        voiced_samples_count = sum(end - start for start, end in voiced_intervals)
        speech_ratio = float(voiced_samples_count / total_samples)

        # 2. Pause Intervals (> 250 ms)
        pauses_ms = []
        
        # Check initial silence before first voiced segment
        if voiced_intervals[0][0] > 0:
            init_gap_ms = (voiced_intervals[0][0] / sr) * 1000.0
            if init_gap_ms > 250.0:
                pauses_ms.append(init_gap_ms)

        # Check gaps between consecutive voiced segments
        for i in range(len(voiced_intervals) - 1):
            gap_samples = voiced_intervals[i + 1][0] - voiced_intervals[i][1]
            if gap_samples > 0:
                gap_ms = (gap_samples / sr) * 1000.0
                if gap_ms > 250.0:
                    pauses_ms.append(gap_ms)

        # Check trailing silence after last voiced segment
        if voiced_intervals[-1][1] < total_samples:
            trail_gap_ms = ((total_samples - voiced_intervals[-1][1]) / sr) * 1000.0
            if trail_gap_ms > 250.0:
                pauses_ms.append(trail_gap_ms)

        pause_count = len(pauses_ms)
        mean_pause_duration_ms = float(np.mean(pauses_ms)) if pause_count > 0 else 0.0

        # 3. Pitch (F0) Jitter computation via pyin
        jitter = 0.0
        try:
            fmin = float(librosa.note_to_hz('C2'))
            fmax = float(librosa.note_to_hz('C7'))
            f0, _, _ = librosa.pyin(y, fmin=fmin, fmax=fmax, sr=sr)
            
            if f0 is not None:
                valid_f0 = f0[~np.isnan(f0)]
                if len(valid_f0) >= 2:
                    periods = 1.0 / valid_f0
                    abs_diffs = np.abs(np.diff(periods))
                    mean_diff = np.mean(abs_diffs)
                    mean_period = np.mean(periods)
                    if mean_period > 0:
                        jitter = float(mean_diff / mean_period)
        except Exception:
            jitter = 0.0

        return AcousticFeatures(
            speech_ratio=round(speech_ratio, 4),
            mean_pause_duration_ms=round(mean_pause_duration_ms, 2),
            pause_count=pause_count,
            jitter=round(jitter, 6)
        )


acoustic_extractor = AcousticExtractor()
