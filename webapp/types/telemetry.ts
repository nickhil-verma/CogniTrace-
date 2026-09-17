export interface TelemetryEvent {
  eventId?: string;
  event: string;
  timestamp: string;
  value?: number | string | boolean;
  metadata?: Record<string, any>;
}
