import React from 'react';
import {
  X,
  Car,
  MapPin,
  Clock,
  Gauge,
  Radio,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { ParkingSlot, ParkingZone } from '../types/parking';

interface SlotDetailModalProps {
  slot: ParkingSlot | null;
  zone: ParkingZone;
  onClose: () => void;
  onToggleSlot: (slotId: number) => void;
}

export const SlotDetailModal: React.FC<SlotDetailModalProps> = ({
  slot,
  zone,
  onClose,
  onToggleSlot
}) => {
  if (!slot) return null;

  const isOccupied = slot.isOccupied;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="modal-top">
          <div className="modal-slot-title-wrap">
            <span className="slot-badge-lg">Slot {slot.code}</span>
            <div>
              <h3 className="modal-title">{zone.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-modal" title="Tutup">
            <X size={20} />
          </button>
        </div>

        {/* Big Status Display */}
        <div className={`status-hero-card ${isOccupied ? 'is-occupied' : 'is-available'}`}>
          <div className="status-hero-icon">
            {isOccupied ? <Car size={36} /> : <CheckCircle2 size={36} />}
          </div>
          <div className="status-hero-text">
            <span className="status-hero-tag">Status Slot</span>
            <h4 className="status-hero-heading">
              {isOccupied ? 'TERISI (MERAH)' : 'KOSONG (HIJAU)'}
            </h4>
            <p className="status-hero-desc">
              {isOccupied
                ? 'Kendaraan sedang terparkir di slot ini.'
                : 'Slot siap digunakan oleh pengendara.'}
            </p>
          </div>
        </div>

        {/* Telemetry / Hardware Metrics */}
        <div className="telemetry-grid">
          <div className="telemetry-item">
            <div className="telemetry-icon-box">
              <Gauge size={16} />
            </div>
            <div>
              <span className="telemetry-lbl">Jarak Sensor</span>
              <strong className="telemetry-val">
                {isOccupied ? `${slot.distanceCm || 15} cm` : '> 150 cm'}
              </strong>
            </div>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-icon-box">
              <Radio size={16} />
            </div>
            <div>
              <span className="telemetry-lbl">Perangkat</span>
              <strong className="telemetry-val">ESP32 HC-SR04</strong>
            </div>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-icon-box">
              <Clock size={16} />
            </div>
            <div>
              <span className="telemetry-lbl">Terakhir Update</span>
              <strong className="telemetry-val">{slot.lastUpdated}</strong>
            </div>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-icon-box">
              <MapPin size={16} />
            </div>
            <div>
              <span className="telemetry-lbl">Protokol</span>
              <strong className="telemetry-val">MQTT / Realtime</strong>
            </div>
          </div>
        </div>

        {/* Toggle Button for Simulation */}
        <div className="modal-actions">
          <button
            onClick={() => {
              onToggleSlot(slot.id);
            }}
            className={`btn-action-toggle ${isOccupied ? 'btn-make-available' : 'btn-make-occupied'}`}
          >
            <RefreshCw size={17} />
            <span>
              {isOccupied ? 'Simulasi: Kosongkan Slot Ini' : 'Simulasi: Isi Slot Ini'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
