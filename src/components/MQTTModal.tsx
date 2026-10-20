import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  Cpu, 
  Copy, 
  Check, 
  Send, 
  Globe, 
  Terminal, 
  Info,
  Layers
} from 'lucide-react';
import { mqttService, MQTTStatus } from '../services/mqttService';

interface MQTTModalProps {
  isOpen: boolean;
  onClose: () => void;
  mqttStatus: MQTTStatus;
  currentBrokerUrl: string;
  topicPrefix: string;
  onUpdateConfig: (brokerUrl: string, topicPrefix: string) => void;
}

export const MQTTModal: React.FC<MQTTModalProps> = ({
  isOpen,
  onClose,
  mqttStatus,
  currentBrokerUrl,
  topicPrefix,
  onUpdateConfig
}) => {
  const [activeTab, setActiveTab] = useState<'broker' | 'esp32'>('broker');
  const [brokerUrl, setBrokerUrl] = useState(currentBrokerUrl);
  const [prefix, setPrefix] = useState(topicPrefix);
  const [testSlotId, setTestSlotId] = useState('1');
  const [testStatus, setTestStatus] = useState<'1' | '0'>('1');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleConnect = () => {
    onUpdateConfig(brokerUrl, prefix);
    mqttService.connect(brokerUrl, prefix);
  };

  const handleDisconnect = () => {
    mqttService.disconnect();
  };

  const handleTestPublish = () => {
    const topic = `${prefix}/A1/slot/${testSlotId}`;
    const payload = JSON.stringify({
      zoneId: 'A1',
      slotId: parseInt(testSlotId, 10),
      isOccupied: testStatus === '1',
      distance_cm: testStatus === '1' ? 14 : 160,
      timestamp: Date.now()
    });
    mqttService.publish(topic, payload);
  };

  const esp32Code = `// ==========================================
// KODE ARDUINO / ESP32 - PROJEK AKHIR PARKMAP
// Komunikasi via MQTT Broker ke Web App ParkMap
// ==========================================

#include <WiFi.h>
#include <PubSubClient.h>

// 1. Konfigurasi WiFi
const char* ssid = "NAMA_WIFI_KAMU";
const char* password = "PASSWORD_WIFI";

// 2. Konfigurasi Broker MQTT (HiveMQ TCP port 1883)
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* topic_slot = "parkmap/A1/slot/1"; // Slot 1 di Area A1

// 3. Pin Sensor Ultrasonik HC-SR04
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;

// Ambang batas jarak (cm) untuk deteksi mobil
const int THRESHOLD_CM = 30;

WiFiClient espClient;
PubSubClient client(espClient);

long measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH);
  long distanceCm = duration * 0.034 / 2;
  return distanceCm;
}

void setup_wifi() {
  Serial.begin(115200);
  Serial.print("Menghubungkan ke ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Terhubung! IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Mencoba koneksi MQTT...");
    String clientId = "ESP32_ParkMap_" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      Serial.println("Terhubung ke MQTT Broker!");
    } else {
      Serial.print("Gagal, rc=");
      Serial.print(client.state());
      delay(3000);
    }
  }
}

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  long distance = measureDistance();
  bool isOccupied = (distance > 0 && distance < THRESHOLD_CM);

  // Buat Payload JSON
  String payload = "{\\"zoneId\\":\\"A1\\",\\"slotId\\":1,\\"isOccupied\\":" + 
                   String(isOccupied ? "true" : "false") + 
                   ",\\"distance_cm\\":" + String(distance) + "}";

  client.publish(topic_slot, payload.c_str());
  Serial.print("Publish: ");
  Serial.println(payload);

  delay(2000); // Kirim update tiap 2 detik
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(esp32Code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-mqtt" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-top">
          <div className="modal-slot-title-wrap">
            <div className="mqtt-header-icon">
              <Radio size={20} />
            </div>
            <div>
              <h3 className="modal-title">Integrasi Sensor & MQTT</h3>
              <p className="modal-subtitle">Protokol komunikasi ESP32 ke ParkMap</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-modal">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'broker' ? 'active' : ''}`}
            onClick={() => setActiveTab('broker')}
          >
            <Globe size={15} />
            <span>Koneksi Broker</span>
          </button>
          <button 
            className={`modal-tab ${activeTab === 'esp32' ? 'active' : ''}`}
            onClick={() => setActiveTab('esp32')}
          >
            <Cpu size={15} />
            <span>Kode ESP32 (Arduino)</span>
          </button>
        </div>

        {/* Tab 1: Broker */}
        {activeTab === 'broker' && (
          <div className="tab-pane">
            {/* Status Card */}
            <div className={`mqtt-connection-status ${mqttStatus}`}>
              <div className="status-dot-pulse"></div>
              <div>
                <strong>
                  {mqttStatus === 'connected' && 'Terhubung ke Broker MQTT'}
                  {mqttStatus === 'connecting' && 'Sedang Menghubungkan...'}
                  {mqttStatus === 'disconnected' && 'Belum Terhubung (Mode Simulasi Aktif)'}
                  {mqttStatus === 'error' && 'Gagal Menghubungi Broker'}
                </strong>
                <p className="status-sub">
                  {mqttStatus === 'connected'
                    ? 'Aplikasi siap menerima data sensor langsung dari ESP32.'
                    : 'Aplikasi saat ini berjalan menggunakan data simulasi internal.'}
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Broker WebSocket URL (WSS)</label>
              <input 
                type="text" 
                value={brokerUrl}
                onChange={(e) => setBrokerUrl(e.target.value)}
                className="form-input"
                placeholder="wss://broker.hivemq.com:8884/mqtt"
              />
              <span className="form-hint">
                Gunakan broker publik gratis (HiveMQ / Mosquitto) atau broker lokal EMQX Anda.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Topik Prefix</label>
              <input 
                type="text" 
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="form-input"
                placeholder="parkmap"
              />
              <span className="form-hint">
                Aplikasi mendengarkan: <code>{prefix}/&#123;zone&#125;/slot/&#123;id&#125;</code>
              </span>
            </div>

            <div className="mqtt-action-row">
              {mqttStatus !== 'connected' ? (
                <button onClick={handleConnect} className="btn-mqtt-connect">
                  <Radio size={16} />
                  <span>Hubungkan Sekarang</span>
                </button>
              ) : (
                <button onClick={handleDisconnect} className="btn-mqtt-disconnect">
                  <span>Putuskan Koneksi</span>
                </button>
              )}
            </div>

            {/* Test Publish Box */}
            <div className="test-publish-box">
              <div className="test-publish-title">
                <Terminal size={15} />
                <span>Uji Kirim Pesan MQTT (Loopback Test)</span>
              </div>
              <div className="test-publish-form">
                <select 
                  value={testSlotId} 
                  onChange={(e) => setTestSlotId(e.target.value)}
                  className="test-select"
                >
                  {Array.from({ length: 16 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Slot #{i + 1}</option>
                  ))}
                </select>

                <select 
                  value={testStatus} 
                  onChange={(e) => setTestStatus(e.target.value as '1' | '0')}
                  className="test-select"
                >
                  <option value="1">Terisi (Merah)</option>
                  <option value="0">Kosong (Hijau)</option>
                </select>

                <button 
                  onClick={handleTestPublish} 
                  disabled={mqttStatus !== 'connected'}
                  className="btn-test-send"
                >
                  <Send size={14} />
                  <span>Kirim</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: ESP32 Code */}
        {activeTab === 'esp32' && (
          <div className="tab-pane">
            <div className="code-header-bar">
              <div className="code-badge">
                <Cpu size={14} />
                <span>Skrip Arduino IDE untuk ESP32</span>
              </div>
              <button onClick={copyToClipboard} className="btn-copy-code">
                {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>

            <div className="code-container">
              <pre><code>{esp32Code}</code></pre>
            </div>

            <div className="esp-tips">
              <Info size={15} />
              <span>
                Upload skrip ini ke board ESP32 Anda. Ubah SSID, password WiFi, dan pin sesuai rangkaian sensor ultrasonic HC-SR04 Anda.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
