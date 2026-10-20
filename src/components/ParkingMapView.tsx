import React from 'react';
import { 
  ArrowLeft, 
  Car, 
  MapPin, 
  Sliders, 
  CheckCircle2, 
  XCircle,
  Radio,
  CornerDownRight,
  CornerUpRight
} from 'lucide-react';
import { ParkingZone, ParkingSlot } from '../types/parking';

import { defaultDestinations } from '../data/defaultZones';

interface ParkingMapViewProps {
  zone: ParkingZone;
  selectedDestinationId?: string;
  onBack: () => void;
  onSelectSlot: (slot: ParkingSlot) => void;
  onOpenSimulation: () => void;
  onOpenMQTT: () => void;
  isMQTTConnected: boolean;
}

export const ParkingMapView: React.FC<ParkingMapViewProps> = ({
  zone,
  selectedDestinationId,
  onBack,
  onSelectSlot,
  onOpenSimulation,
  onOpenMQTT,
  isMQTTConnected
}) => {
  const availableSlots = zone.slots.filter(s => !s.isOccupied).length;
  const occupiedSlots = zone.slots.length - availableSlots;

  const currentDestination = selectedDestinationId 
    ? defaultDestinations.find(d => d.id === selectedDestinationId)
    : null;

  const distInfo = currentDestination && zone.distances[currentDestination.id]
    ? zone.distances[currentDestination.id]
    : null;

  return (
    <div className="map-screen-container">
      {/* Top Header */}
      <div className="map-header">
        <button onClick={onBack} className="btn-back" title="Kembali ke Daftar Area">
          <ArrowLeft size={20} />
        </button>

        <div className="map-header-info">
          <div className="zone-pill-small">
            <MapPin size={12} />
            <span>{zone.floor}</span>
          </div>
          <h2 className="map-zone-title">{zone.name}</h2>
        </div>

        <div className="map-header-actions">
          <button 
            onClick={onOpenMQTT} 
            className={`icon-btn-header ${isMQTTConnected ? 'mqtt-on' : ''}`}
            title="Koneksi MQTT ESP32"
          >
            <Radio size={18} />
          </button>
          <button 
            onClick={onOpenSimulation} 
            className="icon-btn-header sim-btn-active"
            title="Buka Panel Simulasi Sensor"
          >
            <Sliders size={18} />
          </button>
        </div>
      </div>

      {/* Active Destination Navigation Pill */}
      {distInfo && currentDestination && (
        <div className="map-destination-banner">
          <div className="map-dest-left">
            <MapPin size={15} className="text-blue" />
            <div>
              <span className="map-dest-title">Tujuan: <strong>{currentDestination.name}</strong></span>
              <span className="map-dest-sub">Jarak jalan kaki ~{distInfo.meters} m ({distInfo.walkingMinutes} mnt) • {distInfo.note}</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Counter Card */}
      <div className="status-summary-card">
        <div className="status-metric-box metric-green">
          <div className="metric-icon-wrap">
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-val">{availableSlots}</span>
            <span className="metric-lbl">Slot Kosong</span>
          </div>
        </div>

        <div className="status-metric-divider"></div>

        <div className="status-metric-box metric-red">
          <div className="metric-icon-wrap">
            <XCircle size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-val">{occupiedSlots}</span>
            <span className="metric-lbl">Slot Terisi</span>
          </div>
        </div>
      </div>

      {/* Legend & Guidance */}
      <div className="map-legend-bar">
        <div className="legend-item">
          <span className="legend-indicator dot-green"></span>
          <span>Hijau: Kosong</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator dot-red"></span>
          <span>Merah: Terisi</span>
        </div>
        <div className="legend-item">
          <span className="pulse-beacon"></span>
          <span>Realtime Sensor</span>
        </div>
      </div>

      {/* 4x4 Parking Lot Interactive Canvas */}
      <div className="parking-lot-canvas">
        {/* Entry Road Indicator */}
        <div className="parking-roadway roadway-top">
          <div className="lane-marking">
            <CornerDownRight size={14} className="lane-arrow" />
            <span>PINTU MASUK (IN)</span>
          </div>
          <div className="road-dash-line"></div>
        </div>

        {/* 4x4 Grid of Slots */}
        <div className="grid-4x4-wrapper">
          <div className="grid-4x4">
            {zone.slots.map((slot) => {
              const isOccupied = slot.isOccupied;

              return (
                <div
                  key={slot.id}
                  onClick={() => onSelectSlot(slot)}
                  className={`parking-slot-card ${isOccupied ? 'slot-occupied' : 'slot-available'}`}
                  id={`slot-${slot.id}`}
                  role="button"
                  tabIndex={0}
                  title={`Slot ${slot.code} - ${isOccupied ? 'Terisi' : 'Kosong'}`}
                >
                  {/* Slot Number Badge */}
                  <div className="slot-badge-top">
                    <span className="slot-number-text">{slot.code}</span>
                    <span className={`slot-status-dot ${isOccupied ? 'dot-red' : 'dot-green'}`}></span>
                  </div>

                  {/* Slot Visual Core */}
                  <div className="slot-visual-center">
                    {isOccupied ? (
                      <div className="occupied-visual-container">
                        <div className="car-avatar">
                          <Car size={26} className="car-icon-red" />
                        </div>
                        <span className="slot-status-label red-label">TERISI</span>
                      </div>
                    ) : (
                      <div className="available-visual-container">
                        <div className="p-avatar">
                          <span className="p-letter">P</span>
                        </div>
                        <span className="slot-status-label green-label">KOSONG</span>
                      </div>
                    )}
                  </div>

                  {/* Slot Parking Bay Side Borders */}
                  <div className="parking-bay-lines"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exit Road Indicator */}
        <div className="parking-roadway roadway-bottom">
          <div className="road-dash-line"></div>
          <div className="lane-marking exit-marking">
            <CornerUpRight size={14} className="lane-arrow" />
            <span>PINTU KELUAR (OUT)</span>
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="map-bottom-controls">
        <button 
          onClick={onOpenSimulation} 
          className="btn-open-sim"
          title="Buka kontrol simulasi sensor"
        >
          <Sliders size={18} />
          <span>Simulasi Sensor (Ubah Slot)</span>
        </button>
      </div>
    </div>
  );
};
