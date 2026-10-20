import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Radio, 
  Wifi, 
  Battery, 
  Sliders, 
  Car,
  Layers,
  Sparkles
} from 'lucide-react';
import { defaultZones } from './data/defaultZones';
import { ParkingZone, ParkingSlot, ScreenType, SensorPayload } from './types/parking';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ZoneSelector } from './components/ZoneSelector';
import { ParkingMapView } from './components/ParkingMapView';
import { SimulationDrawer } from './components/SimulationDrawer';
import { SlotDetailModal } from './components/SlotDetailModal';
import { MQTTModal } from './components/MQTTModal';
import { mqttService, MQTTStatus } from './services/mqttService';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [zones, setZones] = useState<ParkingZone[]>(defaultZones);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('A19-DEP');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('a20');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  // Modals & Panels
  const [isSimDrawerOpen, setIsSimDrawerOpen] = useState(false);
  const [isMQTTModalOpen, setIsMQTTModalOpen] = useState(false);
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // MQTT Connection state
  const [mqttStatus, setMqttStatus] = useState<MQTTStatus>('disconnected');
  const [brokerUrl, setBrokerUrl] = useState('wss://broker.hivemq.com:8884/mqtt');
  const [topicPrefix, setTopicPrefix] = useState('parkmap');

  // Sensor Event Logs
  const [recentLogs, setRecentLogs] = useState<Array<{ text: string; time: string; type: 'occupied' | 'vacant' | 'info' }>>([
    { text: 'Aplikasi siap - Sensor simulator diinisialisasi', time: '14:00', type: 'info' }
  ]);

  // Current active zone
  const currentZone = zones.find(z => z.id === selectedZoneId) || zones[0];

  // Helper to format current time
  const getTimeStr = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  // --- SENSOR RECEIVER FUNCTION ---
  // Fungsi utama untuk menerima data sensor baik dari MQTT broker maupun simulator
  const handleSensorDataReceived = (payload: SensorPayload) => {
    setZones(prevZones => {
      return prevZones.map(zone => {
        if (zone.id.toUpperCase() !== payload.zoneId.toUpperCase()) {
          return zone;
        }

        const updatedSlots = zone.slots.map(slot => {
          if (slot.id === payload.slotId) {
            return {
              ...slot,
              isOccupied: payload.isOccupied,
              lastUpdated: 'Baru saja',
              distanceCm: payload.distanceCm ?? (payload.isOccupied ? 16 : 150)
            };
          }
          return slot;
        });

        return { ...zone, slots: updatedSlots };
      });
    });

    // Also update selectedSlot if currently open
    setSelectedSlot(prev => {
      if (prev && prev.id === payload.slotId) {
        return {
          ...prev,
          isOccupied: payload.isOccupied,
          lastUpdated: 'Baru saja',
          distanceCm: payload.distanceCm ?? (payload.isOccupied ? 16 : 150)
        };
      }
      return prev;
    });

    // Append log
    const statusText = payload.isOccupied ? 'TERISI (Merah)' : 'KOSONG (Hijau)';
    setRecentLogs(prev => [
      {
        text: `[${payload.zoneId}] Slot #${payload.slotId} berubah: ${statusText}`,
        time: getTimeStr(),
        type: payload.isOccupied ? 'occupied' : 'vacant'
      },
      ...prev.slice(0, 19)
    ]);
  };

  // Setup MQTT event hooks
  useEffect(() => {
    mqttService.setOnMessage((payload) => {
      handleSensorDataReceived(payload);
    });

    mqttService.setOnStatusChange((status) => {
      setMqttStatus(status);
    });

    return () => {
      mqttService.disconnect();
    };
  }, []);

  // --- AUTO SIMULATION TIMER ---
  const autoSimRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (isAutoSimulating) {
      autoSimRef.current = setInterval(() => {
        // Pick a random slot in current zone
        const randomSlotId = Math.floor(Math.random() * 16) + 1;
        const currentSlot = currentZone.slots.find(s => s.id === randomSlotId);
        const newStatus = currentSlot ? !currentSlot.isOccupied : true;

        handleSensorDataReceived({
          zoneId: currentZone.id,
          slotId: randomSlotId,
          isOccupied: newStatus,
          distanceCm: newStatus ? Math.floor(Math.random() * 20) + 10 : 160
        });
      }, 3000);
    } else {
      if (autoSimRef.current) {
        clearInterval(autoSimRef.current);
      }
    }

    return () => {
      if (autoSimRef.current) clearInterval(autoSimRef.current);
    };
  }, [isAutoSimulating, currentZone.id, currentZone.slots]);

  // --- MANUAL SIMULATION HANDLERS ---
  const handleToggleSlot = (slotId: number) => {
    const slot = currentZone.slots.find(s => s.id === slotId);
    if (!slot) return;
    const newOccupied = !slot.isOccupied;

    handleSensorDataReceived({
      zoneId: currentZone.id,
      slotId: slotId,
      isOccupied: newOccupied,
      distanceCm: newOccupied ? 15 : 150
    });
  };

  const handleRandomizeSlots = () => {
    setZones(prevZones => {
      return prevZones.map(zone => {
        if (zone.id !== currentZone.id) return zone;
        const updatedSlots = zone.slots.map(slot => {
          const isOcc = Math.random() > 0.45;
          return {
            ...slot,
            isOccupied: isOcc,
            lastUpdated: 'Baru saja',
            distanceCm: isOcc ? Math.floor(Math.random() * 20) + 10 : 150
          };
        });
        return { ...zone, slots: updatedSlots };
      });
    });

    setRecentLogs(prev => [
      {
        text: `Semua slot di Area ${currentZone.id} telah diacak statusnya`,
        time: getTimeStr(),
        type: 'info'
      },
      ...prev.slice(0, 19)
    ]);
  };

  const handleSetAllSlots = (isOccupied: boolean) => {
    setZones(prevZones => {
      return prevZones.map(zone => {
        if (zone.id !== currentZone.id) return zone;
        const updatedSlots = zone.slots.map(slot => ({
          ...slot,
          isOccupied: isOccupied,
          lastUpdated: 'Baru saja',
          distanceCm: isOccupied ? 14 : 150
        }));
        return { ...zone, slots: updatedSlots };
      });
    });

    setRecentLogs(prev => [
      {
        text: `Semua slot di Area ${currentZone.id} diubah ke ${isOccupied ? 'TERISI' : 'KOSONG'}`,
        time: getTimeStr(),
        type: isOccupied ? 'occupied' : 'vacant'
      },
      ...prev.slice(0, 19)
    ]);
  };

  return (
    <div className="app-root-wrapper">
      {/* Top Desktop Presentation Toolbar */}
      <header className="desktop-presentation-bar">
        <div className="bar-brand">
          <Car size={18} className="brand-icon-nav" />
          <span className="bar-title">ParkMap</span>
          <span className="badge-tag">Smart IoT Parking</span>
        </div>

        <div className="bar-center-info">
          <span className="status-indicator-pill">
            <span className={`status-dot ${mqttStatus === 'connected' ? 'dot-green' : 'dot-blue'}`}></span>
            <span>{mqttStatus === 'connected' ? 'MQTT: Terhubung (ESP32 Live)' : 'Mode: Simulator Aktif'}</span>
          </span>
        </div>

        <div className="bar-controls">
          <button 
            onClick={() => setIsMQTTModalOpen(true)}
            className="bar-btn"
            title="Konfigurasi MQTT & Skrip ESP32"
          >
            <Radio size={14} />
            <span>ESP32 & MQTT</span>
          </button>

          <button 
            onClick={() => setIsSimDrawerOpen(true)}
            className="bar-btn btn-highlight"
            title="Buka Panel Simulasi"
          >
            <Sliders size={14} />
            <span>Panel Simulasi</span>
          </button>

          <div className="view-mode-toggle">
            <button 
              onClick={() => setIsPhoneFrame(true)} 
              className={`toggle-btn ${isPhoneFrame ? 'active' : ''}`}
              title="Tampilan Frame Smartphone"
            >
              <Smartphone size={15} />
              <span>Mobile Frame</span>
            </button>
            <button 
              onClick={() => setIsPhoneFrame(false)} 
              className={`toggle-btn ${!isPhoneFrame ? 'active' : ''}`}
              title="Tampilan Layar Penuh"
            >
              <Monitor size={15} />
              <span>Full View</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className={`mobile-viewport-container ${isPhoneFrame ? 'in-device-frame' : 'in-full-view'}`}>
        {isPhoneFrame ? (
          <div className="smartphone-mockup">
            {/* Phone Hardware Shell */}
            <div className="phone-notch">
              <div className="speaker-grill"></div>
              <div className="camera-lens"></div>
            </div>

            {/* Mobile Status Bar */}
            <div className="mobile-system-bar">
              <span className="status-clock">14:09</span>
              <div className="status-icons">
                <Wifi size={13} />
                <span className="network-speed">5G</span>
                <Battery size={13} />
              </div>
            </div>

            {/* Phone Screen App Shell */}
            <div className="phone-screen-content">
              {currentScreen === 'welcome' && (
                <WelcomeScreen 
                  onStart={() => setCurrentScreen('zones')}
                  zones={zones}
                  onOpenMQTT={() => setIsMQTTModalOpen(true)}
                  isMQTTConnected={mqttStatus === 'connected'}
                />
              )}

              {currentScreen === 'zones' && (
                <ZoneSelector 
                  zones={zones}
                  selectedDestinationId={selectedDestinationId}
                  onSelectDestination={setSelectedDestinationId}
                  onSelectZone={(zone) => {
                    setSelectedZoneId(zone.id);
                    setCurrentScreen('map');
                  }}
                  onBack={() => setCurrentScreen('welcome')}
                />
              )}

              {currentScreen === 'map' && (
                <ParkingMapView 
                  zone={currentZone}
                  selectedDestinationId={selectedDestinationId}
                  onBack={() => setCurrentScreen('zones')}
                  onSelectSlot={(slot) => setSelectedSlot(slot)}
                  onOpenSimulation={() => setIsSimDrawerOpen(true)}
                  onOpenMQTT={() => setIsMQTTModalOpen(true)}
                  isMQTTConnected={mqttStatus === 'connected'}
                />
              )}
            </div>

            {/* Bottom Home Indicator */}
            <div className="home-indicator-bar"></div>
          </div>
        ) : (
          /* Full View Container */
          <div className="fullview-screen-content">
            {currentScreen === 'welcome' && (
              <WelcomeScreen 
                onStart={() => setCurrentScreen('zones')}
                zones={zones}
                onOpenMQTT={() => setIsMQTTModalOpen(true)}
                isMQTTConnected={mqttStatus === 'connected'}
              />
            )}

            {currentScreen === 'zones' && (
              <ZoneSelector 
                zones={zones}
                selectedDestinationId={selectedDestinationId}
                onSelectDestination={setSelectedDestinationId}
                onSelectZone={(zone) => {
                  setSelectedZoneId(zone.id);
                  setCurrentScreen('map');
                }}
                onBack={() => setCurrentScreen('welcome')}
              />
            )}

            {currentScreen === 'map' && (
              <ParkingMapView 
                zone={currentZone}
                selectedDestinationId={selectedDestinationId}
                onBack={() => setCurrentScreen('zones')}
                onSelectSlot={(slot) => setSelectedSlot(slot)}
                onOpenSimulation={() => setIsSimDrawerOpen(true)}
                onOpenMQTT={() => setIsMQTTModalOpen(true)}
                isMQTTConnected={mqttStatus === 'connected'}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals & Simulation Drawers */}
      <SimulationDrawer 
        isOpen={isSimDrawerOpen}
        onClose={() => setIsSimDrawerOpen(false)}
        currentZone={currentZone}
        onToggleSlot={handleToggleSlot}
        onRandomize={handleRandomizeSlots}
        onSetAll={handleSetAllSlots}
        isAutoSimulating={isAutoSimulating}
        onToggleAutoSim={() => setIsAutoSimulating(!isAutoSimulating)}
        recentLogs={recentLogs}
      />

      <SlotDetailModal 
        slot={selectedSlot}
        zone={currentZone}
        onClose={() => setSelectedSlot(null)}
        onToggleSlot={(id) => {
          handleToggleSlot(id);
        }}
      />

      <MQTTModal 
        isOpen={isMQTTModalOpen}
        onClose={() => setIsMQTTModalOpen(false)}
        mqttStatus={mqttStatus}
        currentBrokerUrl={brokerUrl}
        topicPrefix={topicPrefix}
        onUpdateConfig={(url, prefix) => {
          setBrokerUrl(url);
          setTopicPrefix(prefix);
        }}
      />
    </div>
  );
};
