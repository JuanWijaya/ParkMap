import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  MapPin,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sparkles,
  Layers,
  Navigation,
  Compass,
  Footprints,
  AlertTriangle,
  Award
} from 'lucide-react';
import { ParkingZone, Destination } from '../types/parking';
import { defaultDestinations } from '../data/defaultZones';

interface ZoneSelectorProps {
  zones: ParkingZone[];
  selectedDestinationId: string;
  onSelectDestination: (destId: string) => void;
  onSelectZone: (zone: ParkingZone) => void;
  onBack: () => void;
}

export const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  zones,
  selectedDestinationId,
  onSelectDestination,
  onSelectZone,
  onBack
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const currentDestination = useMemo(() => {
    return defaultDestinations.find(d => d.id === selectedDestinationId) || null;
  }, [selectedDestinationId]);

  // Kalkulasi rekomendasi berdasarkan jarak & ketersediaan slot
  const processedZones = useMemo(() => {
    const list = zones.map(zone => {
      const availableCount = zone.slots.filter(s => !s.isOccupied).length;
      const occupiedCount = zone.slots.length - availableCount;
      const isFull = availableCount === 0;

      let distanceInfo = null;
      let score = 0;

      if (currentDestination && zone.distances[currentDestination.id]) {
        distanceInfo = zone.distances[currentDestination.id];

        // Algoritma Smart Score:
        // Bobot jarak: semakin dekat (meter kecil), nilai makin besar
        // Bobot slot: setiap slot kosong menambah poin
        // Jika penuh (isFull), beri penalti sangat besar
        if (isFull) {
          score = -500 + (1000 - distanceInfo.meters); // Paling bawah dibanding yang punya slot
        } else {
          score = (1000 - distanceInfo.meters) + (availableCount * 25);
        }
      } else {
        // Tanpa filter tujuan: prioritaskan slot terbanyak
        score = availableCount;
      }

      return {
        ...zone,
        availableCount,
        occupiedCount,
        isFull,
        distanceInfo,
        score
      };
    });

    // Urutkan berdasarkan score rekomendasi jika tujuan dipilih
    if (currentDestination) {
      list.sort((a, b) => b.score - a.score);
    }

    return list;
  }, [zones, currentDestination]);

  // Filter dengan input pencarian
  const filteredZones = useMemo(() => {
    return processedZones.filter(zone =>
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedZones, searchTerm]);

  // Zona nomor 1 yang menjadi rekomendasi terbaik
  const topRecommendedZone = currentDestination && filteredZones.length > 0 && !filteredZones[0].isFull
    ? filteredZones[0]
    : null;

  return (
    <div className="zone-container">
      {/* Top Header */}
      <div className="screen-header">
        <button onClick={onBack} className="btn-back" title="Kembali ke Beranda">
          <ArrowLeft size={20} />
        </button>
        <div className="header-titles">
          <h2 className="screen-title">Pilih Area Parkir</h2>
        </div>
      </div>

      {/* Destination Picker Section (Fitur Tempat Tujuan) */}
      <div className="destination-selector-card">
        <div className="dest-header-row">
          <div className="dest-title-wrap">
            <Compass size={16} className="text-blue" />
            <span className="dest-section-title">Mau pergi ke mana? (Pilih Tujuan)</span>
          </div>
          {selectedDestinationId && (
            <button
              onClick={() => onSelectDestination('')}
              className="btn-clear-dest"
            >
              Reset
            </button>
          )}
        </div>

        {/* Destination Chips Carousel */}
        <div className="destination-chips-scroll">
          <button
            onClick={() => onSelectDestination('')}
            className={`dest-chip ${!selectedDestinationId ? 'active' : ''}`}
          >
            <span>Semua Tujuan</span>
          </button>

          {defaultDestinations.map((dest) => (
            <button
              key={dest.id}
              onClick={() => onSelectDestination(dest.id)}
              className={`dest-chip ${selectedDestinationId === dest.id ? 'active' : ''}`}
            >
              <Navigation size={12} className="dest-chip-icon" />
              <span>{dest.shortName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Smart Recommendation Banner */}
      {topRecommendedZone && currentDestination && (
        <div className="smart-recommend-banner">
          <div className="smart-banner-header">
            <div className="smart-badge">
              <Award size={14} />
              <span>Rekomendasi Terbaik</span>
            </div>
            <span className="smart-dest-pill">Tujuan: {currentDestination.shortName}</span>
          </div>

          <div className="smart-banner-body">
            <h4 className="smart-rec-name">{topRecommendedZone.name}</h4>
            <p className="smart-rec-reason">
              Jarak terdekat (<strong>{topRecommendedZone.distanceInfo?.meters} m</strong>, ~{topRecommendedZone.distanceInfo?.walkingMinutes} mnt jalan kaki) dan masih tersedia <strong>{topRecommendedZone.availableCount} slot kosong</strong>!
            </p>
          </div>

          <button
            onClick={() => onSelectZone(topRecommendedZone)}
            className="btn-quick-pick-rec"
          >
            <span>Pilih Parkir Ini Sekarang</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Cari parkiran: GKB A19, A20, Kantin FIS, B12, UM Mart..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="btn-clear-search">
            ✕
          </button>
        )}
      </div>

      {/* Parking Zones List */}
      <div className="zone-list">
        {filteredZones.map((zone, index) => {
          const isTopMatch = currentDestination && index === 0 && !zone.isFull;
          const availablePercentage = Math.round((zone.availableCount / zone.totalSlots) * 100);
          const dist = zone.distanceInfo;

          return (
            <div
              key={zone.id}
              className={`zone-card ${isTopMatch ? 'zone-card-featured' : ''}`}
              onClick={() => onSelectZone(zone)}
            >
              {/* Card Top Tag / Best Match Label */}
              <div className="zone-card-header">
                <div className="zone-tag">
                  <span className="zone-id-badge">{zone.id}</span>
                  <div>
                    <div className="zone-name-row">
                      <h3 className="zone-name">{zone.name}</h3>
                      {isTopMatch && (
                        <span className="badge-best-match">
                          <Sparkles size={11} />
                          <span>Paling Ideal</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="zone-arrow-btn">
                  <ChevronRight size={18} />
                </div>
              </div>

              {/* Description */}
              <p className="zone-desc">{zone.description}</p>

              {/* Distance to Destination Highlight */}
              {dist && currentDestination && (
                <div className={`distance-proximity-box ${dist.proximityLevel}`}>
                  <div className="dist-proximity-left">
                    <Footprints size={14} />
                    <span className="dist-proximity-text">
                      <strong>{dist.meters} m</strong> ({dist.walkingMinutes} mnt jalan) ke {currentDestination.shortName}
                    </span>
                  </div>
                  <span className={`proximity-badge badge-${dist.proximityLevel}`}>
                    {dist.note}
                  </span>
                </div>
              )}

              {/* Warning if closest but full */}
              {zone.isFull && (
                <div className="zone-full-alert">
                  <AlertTriangle size={13} />
                  <span>Semua slot saat ini sedang penuh!</span>
                </div>
              )}

              {/* Availability Progress Bar */}
              <div className="availability-bar-container">
                <div className="availability-bar-header">
                  <span className="avail-percent-label">{availablePercentage}% Kosong</span>
                  <span className="avail-count-label">{zone.availableCount} dari {zone.totalSlots} Slot</span>
                </div>
                <div className="bar-track">
                  <div
                    className={`bar-fill ${zone.isFull ? 'bar-fill-full' : ''}`}
                    style={{ width: `${availablePercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Stat Chips */}
              <div className="zone-chips">
                <span className={`chip ${zone.availableCount > 0 ? 'chip-green' : 'chip-red'}`}>
                  {zone.availableCount > 0 ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>{zone.availableCount} Kosong</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={13} />
                      <span>Penuh</span>
                    </>
                  )}
                </span>

                <span className="chip chip-red">
                  <XCircle size={13} />
                  <span>{zone.occupiedCount} Terisi</span>
                </span>

                <span className="chip chip-neutral">
                  <Layers size={13} />
                  <span>4x4 Grid</span>
                </span>
              </div>
            </div>
          );
        })}

        {filteredZones.length === 0 && (
          <div className="empty-search-state">
            <p>Area parkir tidak ditemukan.</p>
            <button onClick={() => setSearchTerm('')} className="btn-reset-filter">
              Tampilkan Semua Area
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
