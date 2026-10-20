import React from 'react';
import {
  Car,
  MapPin,
  ClockIcon,
  Radio,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { ParkingZone } from '../types/parking';

interface WelcomeScreenProps {
  onStart: () => void;
  zones: ParkingZone[];
  onOpenMQTT: () => void;
  isMQTTConnected: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart,
  zones,
  onOpenMQTT,
  isMQTTConnected
}) => {
  const totalSlots = zones.reduce((acc, z) => acc + z.slots.length, 0);
  const availableSlots = zones.reduce(
    (acc, z) => acc + z.slots.filter(s => !s.isOccupied).length,
    0
  );

  return (
    <div className="welcome-container">
      {/* Top Header Bar */}
      <div className="welcome-topbar">
        <div className="brand-badge">
          <div className="brand-icon-box">
            <Car className="brand-icon" size={20} />
          </div>
          <span className="brand-text">ParkMap</span>
        </div>

        <button
          onClick={onOpenMQTT}
          className={`mqtt-pill-btn ${isMQTTConnected ? 'connected' : ''}`}
          title="Konfigurasi MQTT ESP32"
        >
          <Radio size={14} className={isMQTTConnected ? 'pulse-icon' : ''} />
          <span>{isMQTTConnected ? 'MQTT Aktif' : 'MQTT Setup'}</span>
        </button>
      </div>

      {/* Hero Visual Area */}
      <div className="hero-section">
        <div className="radar-container">
          <div className="radar-circle-outer">
            <div className="radar-circle-middle">
              <div className="radar-circle-inner">
                <div className="hero-icon-center">
                  <Car size={38} className="hero-car" />
                </div>
              </div>
            </div>
            <div className="radar-beam"></div>
          </div>

          {/* Floating mini indicators (keep upright) */}
          <div className="floating-badge badge-top">
            <span className="dot dot-green"></span>
            <span>Slot Kosong</span>
          </div>
          <div className="floating-badge badge-bottom">
            <span className="dot dot-red"></span>
            <span>Slot Terisi</span>
          </div>
        </div>
      </div>

      {/* Main Copy */}
      <div className="welcome-content">
        <div className="badge-highlight">
          <Sparkles size={14} />
          <span>Solusi Smart Parking IoT</span>
        </div>

        <h1 className="welcome-title">
          Temukan Slot Parkir <br />
          <span className="text-gradient">Mudah & Realtime</span>
        </h1>

        <p className="welcome-subtitle">
          Monitoring ketersediaan slot parkir secara akurat dengan integrasi sensor cerdas dan visualisasi peta interaktif.
        </p>

        {/* Live Stat Banner */}
        <div className="quick-stats-card">
          <div className="stat-item">
            <span className="stat-label">Slot Tersedia</span>
            <div className="stat-val text-green">
              <span className="stat-number">{availableSlots}</span>
              <span className="stat-unit">/{totalSlots}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">Area Parkir</span>
            <div className="stat-val text-blue">
              <span className="stat-number">{zones.length}</span>
              <span className="stat-unit">Zona</span>
            </div>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="feature-pill-list">
          <div className="feature-pill">
            <ClockIcon size={14} className="feature-icon" />
            <span>Anti Telat</span>
          </div>
          <div className="feature-pill">
            <Layers size={14} className="feature-icon" />
            <span>Peta Realtime</span>
          </div>
          <div className="feature-pill">
            <MapPin size={14} className="feature-icon" />
            <span>Sensor Akurat</span>
          </div>
        </div>

        {/* CTA Button */}
        <button onClick={onStart} className="btn-primary-start">
          <span>Mulai Cari Parkir</span>
          <div className="btn-icon-circle">
            <ArrowRight size={18} />
          </div>
        </button>
      </div>
    </div>
  );
};
