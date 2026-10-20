export interface ParkingSlot {
  id: number;
  code: string;
  isOccupied: boolean;
  lastUpdated: string;
  distanceCm?: number;
  sensorType?: 'ultrasonic' | 'infrared' | 'simulated';
}

export interface ZoneDistance {
  meters: number;
  walkingMinutes: number;
  proximityLevel: 'closest' | 'moderate' | 'far'; // closest: paling dekat, moderate: agak dekat, far: lebih jauh
  note: string; // e.g. "Paling dekat", "Agak dekat"
}

export interface ParkingZone {
  id: string;
  name: string;
  floor?: string;
  description: string;
  totalSlots: number;
  slots: ParkingSlot[];
  distances: Record<string, ZoneDistance>; // Keyed by destinationId
}

export interface Destination {
  id: string;
  name: string;
  shortName: string;
  category: 'gedung' | 'fakultas' | 'fasilitas';
  description: string;
}

export interface MQTTConfig {
  brokerUrl: string;
  topicPrefix: string;
  clientId: string;
  isConnected: boolean;
  lastMessage?: string;
  lastTopic?: string;
}

export type ScreenType = 'welcome' | 'zones' | 'map';

export interface SensorPayload {
  zoneId: string;
  slotId: number;
  isOccupied: boolean;
  distanceCm?: number;
  timestamp?: number;
}
