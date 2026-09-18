import numpy as np
from typing import Optional, List
from app.models.schemas import AcousticFeatures, LinguisticFeatures, TelemetryData, RiskReport


class RiskEngine:
    """
    Multimodal Dementia & Cognitive Impairment Risk Scoring Engine.
    Combines Acoustic (35%), Lexical (35%), and Psychomotor (30%) digital biomarkers.
    """

    def compute_acoustic_score(self, acoustic: AcousticFeatures, indicators: List[str]) -> float:
        score = 0.0

        # Speech ratio check (< 0.65 starts adding risk)
        if acoustic.speech_ratio < 0.40:
            score += 0.40
            indicators.append(f"Severe speech reduction observed (speech ratio: {acoustic.speech_ratio * 100:.1f}%).")
        elif acoustic.speech_ratio < 0.65:
            score += 0.20
            indicators.append(f"Moderate speech hesitation observed (speech ratio: {acoustic.speech_ratio * 100:.1f}%).")

        # Pause duration check (> 600ms)
        if acoustic.mean_pause_duration_ms > 800.0:
            score += 0.35
            indicators.append(f"Extended hesitation pauses detected (mean pause: {acoustic.mean_pause_duration_ms:.0f} ms).")
        elif acoustic.mean_pause_duration_ms > 450.0:
            score += 0.20
            indicators.append(f"Elevated pause duration detected (mean pause: {acoustic.mean_pause_duration_ms:.0f} ms).")

        # Pause count check (> 5)
        if acoustic.pause_count > 6:
            score += 0.15
        elif acoustic.pause_count > 3:
            score += 0.10

        # Jitter check (> 0.015)
        if acoustic.jitter > 0.02:
            score += 0.10
            indicators.append(f"Elevated pitch perturbation / F0 jitter detected ({acoustic.jitter:.4f}).")

        return min(1.0, score)

    def compute_lexical_score(self, linguistic: LinguisticFeatures, indicators: List[str]) -> float:
        score = 0.0

        # Type-Token Ratio (TTR) check (< 0.50 indicates constricted vocabulary)
        if linguistic.type_token_ratio < 0.40:
            score += 0.40
            indicators.append(f"Severe lexical constriction detected (Type-Token Ratio: {linguistic.type_token_ratio:.2f}).")
        elif linguistic.type_token_ratio < 0.55:
            score += 0.20
            indicators.append(f"Reduced vocabulary diversity (Type-Token Ratio: {linguistic.type_token_ratio:.2f}).")

        # Verbal repetitions count (> 2)
        if linguistic.repetitions >= 4:
            score += 0.35
            indicators.append(f"Frequent consecutive word repetitions detected ({linguistic.repetitions} occurrences).")
        elif linguistic.repetitions >= 2:
            score += 0.20
            indicators.append(f"Immediate word repetition detected ({linguistic.repetitions} occurrences).")

        # Hesitation markers count ("um", "uh", "ah")
        if linguistic.hesitation_markers >= 4:
            score += 0.25
            indicators.append(f"High frequency of verbal hesitation markers ({linguistic.hesitation_markers} markers).")
        elif linguistic.hesitation_markers >= 2:
            score += 0.15

        return min(1.0, score)

    def compute_psychomotor_score(self, telemetry: Optional[TelemetryData], indicators: List[str]) -> float:
        if not telemetry:
            return 0.15  # Default normal baseline if motor telemetry is not supplied

        score = 0.0

        # Tap latencies analysis
        if telemetry.tap_latencies_ms:
            mean_latency = float(np.mean(telemetry.tap_latencies_ms))
            if mean_latency > 350.0:
                score += 0.40
                indicators.append(f"Sluggish tap reaction latency (mean latency: {mean_latency:.0f} ms).")
            elif mean_latency > 250.0:
                score += 0.20

            # Latency variance / motor motor instability
            if len(telemetry.tap_latencies_ms) > 2:
                std_latency = float(np.std(telemetry.tap_latencies_ms))
                if std_latency > 100.0:
                    score += 0.15
                    indicators.append(f"High tap rhythm variability (std dev: {std_latency:.0f} ms).")

        # Reaction times analysis
        if telemetry.reaction_times_ms:
            mean_reaction = float(np.mean(telemetry.reaction_times_ms))
            if mean_reaction > 500.0:
                score += 0.35
                indicators.append(f"Delayed choice reaction time (mean: {mean_reaction:.0f} ms).")

        # Error rate
        if telemetry.error_rate > 0.20:
            score += 0.35
            indicators.append(f"Elevated interaction error rate during spatial task ({telemetry.error_rate * 100:.1f}%).")
        elif telemetry.error_rate > 0.10:
            score += 0.20

        return min(1.0, score)

    def evaluate_risk(
        self,
        acoustic: AcousticFeatures,
        linguistic: LinguisticFeatures,
        telemetry: Optional[TelemetryData] = None
    ) -> RiskReport:
        indicators: List[str] = []

        acoustic_score = self.compute_acoustic_score(acoustic, indicators)
        lexical_score = self.compute_lexical_score(linguistic, indicators)
        psychomotor_score = self.compute_psychomotor_score(telemetry, indicators)

        # Composite Weighted Scoring Formula:
        # Acoustic (35%), Lexical (35%), Psychomotor (30%)
        composite = (0.35 * acoustic_score) + (0.35 * lexical_score) + (0.30 * psychomotor_score)
        composite = round(min(1.0, max(0.0, composite)), 4)

        # Tier Classification
        if composite >= 0.65:
            risk_tier = "HIGH_RISK"
        elif composite >= 0.35:
            risk_tier = "MCI"
        else:
            risk_tier = "NORMAL"

        if not indicators:
            indicators.append("Cognitive digital biomarkers are within normal healthy parameters.")

        return RiskReport(
            composite_score=composite,
            risk_tier=risk_tier,
            clinical_indicators=indicators,
            breakdown={
                "acoustic": round(acoustic_score, 4),
                "lexical": round(lexical_score, 4),
                "psychomotor": round(psychomotor_score, 4)
            }
        )


risk_engine = RiskEngine()
