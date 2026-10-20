import mqtt, { MqttClient } from 'mqtt';
import { SensorPayload } from '../types/parking';

export type MQTTStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

class MQTTService {
  private client: MqttClient | null = null;
  private status: MQTTStatus = 'disconnected';
  private onMessageCallback: ((payload: SensorPayload) => void) | null = null;
  private onStatusChangeCallback: ((status: MQTTStatus, errorMsg?: string) => void) | null = null;
  private activeTopic: string = 'parkmap/#';

  public connect(
    brokerUrl: string = 'wss://broker.hivemq.com:8884/mqtt',
    topicPrefix: string = 'parkmap'
  ) {
    if (this.client) {
      this.disconnect();
    }

    this.setStatus('connecting');
    this.activeTopic = `${topicPrefix}/#`;

    try {
      const clientId = `parkmap_client_${Math.random().toString(16).substring(2, 8)}`;
      
      this.client = mqtt.connect(brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 4000,
      });

      this.client.on('connect', () => {
        this.setStatus('connected');
        this.client?.subscribe(this.activeTopic, (err) => {
          if (err) {
            console.error('MQTT subscribe error:', err);
          } else {
            console.log(`Subscribed to topic: ${this.activeTopic}`);
          }
        });
      });

      this.client.on('message', (topic, message) => {
        try {
          const payloadStr = message.toString();
          this.parseAndDispatch(topic, payloadStr);
        } catch (e) {
          console.error('Error handling MQTT message:', e);
        }
      });

      this.client.on('error', (err) => {
        console.error('MQTT Error:', err);
        this.setStatus('error', err.message);
      });

      this.client.on('close', () => {
        if (this.status !== 'disconnected') {
          this.setStatus('disconnected');
        }
      });
    } catch (err: any) {
      console.error('Failed to initiate MQTT connection:', err);
      this.setStatus('error', err.message);
    }
  }

  public disconnect() {
    if (this.client) {
      try {
        this.client.end(true);
      } catch (e) {
        // ignore
      }
      this.client = null;
    }
    this.setStatus('disconnected');
  }

  public setOnMessage(callback: (payload: SensorPayload) => void) {
    this.onMessageCallback = callback;
  }

  public setOnStatusChange(callback: (status: MQTTStatus, errorMsg?: string) => void) {
    this.onStatusChangeCallback = callback;
  }

  public getStatus(): MQTTStatus {
    return this.status;
  }

  // Publish a test message (useful for testing MQTT loopback)
  public publish(topic: string, message: string) {
    if (this.client && this.client.connected) {
      this.client.publish(topic, message);
    }
  }

  private setStatus(status: MQTTStatus, errorMsg?: string) {
    this.status = status;
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status, errorMsg);
    }
  }

  private parseAndDispatch(topic: string, payloadStr: string) {
    // Topic formats supported:
    // 1. "parkmap/{zoneId}/slot/{slotId}"
    // 2. "parkmap/{zoneId}/{slotId}"
    const parts = topic.split('/');
    let zoneId = 'A1';
    let slotId = 1;

    if (parts.length >= 4 && parts[2] === 'slot') {
      zoneId = parts[1].toUpperCase();
      slotId = parseInt(parts[3], 10);
    } else if (parts.length >= 3) {
      zoneId = parts[1].toUpperCase();
      slotId = parseInt(parts[2], 10);
    }

    let isOccupied = false;
    let distanceCm: number | undefined;

    try {
      // Try JSON parsing
      const data = JSON.parse(payloadStr);
      if (typeof data.isOccupied === 'boolean') {
        isOccupied = data.isOccupied;
      } else if (typeof data.occupied === 'boolean') {
        isOccupied = data.occupied;
      } else if (typeof data.status === 'string') {
        isOccupied = data.status.toLowerCase() === 'occupied' || data.status === '1';
      } else if (typeof data.status === 'number') {
        isOccupied = data.status === 1;
      }

      if (data.zoneId) zoneId = data.zoneId.toUpperCase();
      if (data.slotId) slotId = parseInt(data.slotId, 10);
      if (data.slot) slotId = parseInt(data.slot, 10);
      if (typeof data.distance_cm === 'number') distanceCm = data.distance_cm;
      if (typeof data.distance === 'number') distanceCm = data.distance;
    } catch {
      // Plain text payload: "1" = occupied, "0" = vacant
      const trimmed = payloadStr.trim().toLowerCase();
      isOccupied = trimmed === '1' || trimmed === 'true' || trimmed === 'occupied';
    }

    if (!isNaN(slotId) && this.onMessageCallback) {
      this.onMessageCallback({
        zoneId,
        slotId,
        isOccupied,
        distanceCm,
        timestamp: Date.now()
      });
    }
  }
}

export const mqttService = new MQTTService();
