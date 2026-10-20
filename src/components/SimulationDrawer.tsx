import React from 'react';
import { 
  X, 
  RotateCcw, 
  Shuffle, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause,
  Sliders,
  Radio
} from 'lucide-react';
import { ParkingZone } from '../types/parking';

interface SimulationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentZone: ParkingZone;
  onToggleSlot: (slotId: number) => void;
  onRandomize: () => void;
  onSetAll: (isOccupied: boolean) => void;
  isAutoSimulating: boolean;
  onToggleAutoSim: () => void;
  recentLogs: Array<{ text: string; time: string; type: 'occupied' | 'vacant' | 'info' }>;
}

export const SimulationDrawer: React.FC<SimulationDrawerProps> = ({
  isOpen,
  onClose,
  currentZone,
  onToggleSlot,
  onRandomize,
  onSetAll,
  isAutoSimulating,
  onToggleAutoSim,
  recentLogs
}) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-wrap">
            <div className="drawer-icon-box">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="drawer-title">Simulasi Sensor ({currentZone.id})</h3>
              <p className="drawer-subtitle">Uji respon sensor tanpa hardware fisik</p>
            </div>
          </div>
          <button onClick={onClose} className="drawer-close-btn" title="Tutup">
            <X size={20} />
          </button>
        </div>

        {/* Auto Simulation Banner */}
        <div className={`auto-sim-banner ${isAutoSimulating ? 'active' : ''}`}>
          <div className="auto-sim-info">
            <div className="auto-sim-icon">
              {isAutoSimulating ? <Play size={18} /> : <Pause size={18} />}
            </div>
            <div>
              <strong className="auto-sim-title">Simulasi Otomatis</strong>
              <p className="auto-sim-desc">
                {isAutoSimulating 
                  ? 'Mobil masuk & keluar otomatis setiap 3 detik' 
                  : 'Aktifkan untuk demo dinamis tanpa klik manual'}
              </p>
            </div>
          </div>
          <button 
            onClick={onToggleAutoSim} 
            className={`btn-toggle-auto ${isAutoSimulating ? 'btn-stop' : 'btn-start'}`}
          >
            {isAutoSimulating ? 'Hentikan' : 'Mulai'}
          </button>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="sim-global-actions">
          <button onClick={onRandomize} className="sim-btn-action" title="Acak kondisi slot">
            <Shuffle size={15} />
            <span>Acak Status</span>
          </button>
          <button onClick={() => onSetAll(false)} className="sim-btn-action" title="Semua slot kosong">
            <CheckCircle size={15} className="text-green" />
            <span>Semua Kosong</span>
          </button>
          <button onClick={() => onSetAll(true)} className="sim-btn-action" title="Semua slot terisi">
            <AlertCircle size={15} className="text-red" />
            <span>Semua Terisi</span>
          </button>
        </div>

        {/* 16 Slot Toggle Matrix */}
        <div className="sim-slot-matrix-section">
          <label className="section-label">
            Klik slot di bawah untuk ubah status secara manual:
          </label>
          <div className="sim-matrix-grid">
            {currentZone.slots.map((slot) => {
              const isOccupied = slot.isOccupied;
              return (
                <button
                  key={slot.id}
                  onClick={() => onToggleSlot(slot.id)}
                  className={`sim-slot-btn ${isOccupied ? 'is-red' : 'is-green'}`}
                  title={`Ubah Slot ${slot.code}`}
                >
                  <span className="sim-slot-id">#{slot.code}</span>
                  <span className="sim-slot-badge">
                    {isOccupied ? 'Terisi' : 'Kosong'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Sensor Trigger Log */}
        <div className="sim-logs-section">
          <div className="logs-header">
            <Radio size={14} />
            <span>Log Aktivitas Sensor Terkini</span>
          </div>
          <div className="logs-container">
            {recentLogs.length === 0 ? (
              <p className="empty-log">Belum ada aktivitas sensor baru.</p>
            ) : (
              recentLogs.slice(0, 4).map((log, index) => (
                <div key={index} className={`log-row ${log.type}`}>
                  <span className="log-time">{log.time}</span>
                  <span className="log-text">{log.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
