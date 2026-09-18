from datetime import datetime, timedelta
import numpy as np
from typing import List, Optional
from app.models.schemas import HistoricalAssessment, DriftAnalysisResponse


class LongitudinalTracker:
    """
    Computes linear regression trend slopes over rolling 30-day windows
    to detect progressive cognitive decline and trigger caregiver alerts.
    """

    def analyze_drift(
        self,
        history: List[HistoricalAssessment],
        window_days: int = 30
    ) -> DriftAnalysisResponse:
        if not history or len(history) < 2:
            return DriftAnalysisResponse(
                window_days=window_days,
                slope=0.0,
                percent_change=0.0,
                drift_detected=False,
                alert_message=None
            )

        # Sort history by timestamp ascending
        sorted_history = sorted(history, key=lambda x: x.timestamp)
        latest_time = sorted_history[-1].timestamp
        cutoff_time = latest_time - timedelta(days=window_days)

        # Filter points within window
        window_points = [p for p in sorted_history if p.timestamp >= cutoff_time]
        if len(window_points) < 2:
            window_points = sorted_history[-2:]  # Use at least last 2 available data points

        t0 = window_points[0].timestamp
        x = np.array([(p.timestamp - t0).total_seconds() / 86400.0 for p in window_points], dtype=np.float64)
        y = np.array([p.risk_score for p in window_points], dtype=np.float64)

        # Handle identical timestamps / x values
        if np.max(x) == np.min(x):
            return DriftAnalysisResponse(
                window_days=window_days,
                slope=0.0,
                percent_change=0.0,
                drift_detected=False,
                alert_message=None
            )

        # Compute linear regression slope (y = m * x + c)
        slope, intercept = np.polyfit(x, y, 1)
        slope = float(slope)  # Risk score change per day

        # Expected 30-day total risk score shift
        projected_30d_shift = slope * 30.0
        baseline_score = float(y[0])

        if baseline_score > 0.01:
            percent_change = (projected_30d_shift / baseline_score) * 100.0
        else:
            percent_change = projected_30d_shift * 100.0

        percent_change = float(percent_change)

        # Threshold check: Alert if cognitive drift indicates > 20% deterioration over 30 days
        drift_detected = False
        alert_message: Optional[str] = None

        if percent_change >= 20.0 or projected_30d_shift >= 0.15:
            drift_detected = True
            alert_message = (
                f"CAREGIVER ALERT: Cognitive drift threshold exceeded! "
                f"30-day deterioration trend is {percent_change:+.1f}% (slope: {slope:+.4f}/day)."
            )

        return DriftAnalysisResponse(
            window_days=window_days,
            slope=round(slope, 6),
            percent_change=round(percent_change, 2),
            drift_detected=drift_detected,
            alert_message=alert_message
        )


longitudinal_tracker = LongitudinalTracker()
