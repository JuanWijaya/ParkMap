# 🚗 ParkMap - Smart IoT Parking Slot Monitoring System

Aplikasi mobile-first monitoring slot parkir cerdas berbasis IoT (ESP32) dengan visualisasi peta interaktif 4x4, sistem rekomendasi tujuan cerdas, dan panel simulasi sensor realtime.

---

## 🌟 Fitur Utama

- **Peta Interaktif 4x4 Slot (16 Slot per Area)**:
  - 🟢 **Hijau (Kosong / Tersedia)**: Dilengkapi lambang `P` dan telemetry status siap pakai.
  - 🔴 **Merah (Terisi)**: Dilengkapi ikon visual mobil dan waktu parkir.
  - Marka jalur jalan masuk (*IN*) dan jalur keluar (*OUT*).
- **Sistem Rekomendasi Tujuan Cerdas (*Smart Recommendation Engine*)**:
  - Pilihan tujuan kampus (Gedung A20, Gedung A19, Fak. Teknik, Fak. FIS, Fak. MIPA, Perpustakaan).
  - Algoritma adaptif memprioritaskan jarak terdekat (meter & estimasi menit jalan kaki) serta ketersediaan slot kosong.
  - Proteksi slot penuh: jika lokasi terdekat penuh, otomatis merekomendasikan opsi alternatif terdekat yang masih memiliki slot.
- **Dukungan 6 Area Parkir (1 Lantai)**:
  1. GKB A19 Depan
  2. GKB A19 Belakang
  3. GKB A20 Belakang
  4. Kantin FIS
  5. B12 (Fakultas Teknik)
  6. UM Mart
- **Panel Kontrol Simulasi Sensor (Demo Mode)**:
  - Toggle manual status per slot (Slot 1 - 16).
  - Tombol acak status (*Randomize*).
  - Tombol kosongkan semua / penuhi semua.
  - Mode simulasi otomatis (kendaraan keluar-masuk otomatis tiap 3 detik).
- **Siap Terhubung ke Hardware ESP32 & Broker MQTT**:
  - Protokol WebSocket MQTT siap pakai (`parkmap/{zoneId}/slot/{slotId}`).
  - Dilengkapi skrip kode Arduino C++ untuk ESP32 + Sensor Ultrasonik HC-SR04 langsung di dalam aplikasi.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Modern Vanilla CSS (Clean Blue & White Design System, Glassmorphism, Micro-Animations)
- **Icons**: Lucide React
- **IoT Communication**: MQTT.js (WebSocket Client)

---

## 🚀 Cara Menjalankan

1. Clone repositori:
   ```bash
   git clone https://github.com/JuanWijaya/ParkMap.git
   cd ParkMap
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```

4. Buka di browser:
   - Laptop / Desktop: `http://localhost:5173/`
   - Smartphone (Satu Jaringan Wi-Fi): Buka IP lokal yang tertera di terminal (contoh: `http://192.168.1.xx:5173/`)

---

## 👨‍💻 Pengembang
Project Tugas Akhir - Manajemen Inovasi
Aplikasi Smart Parking ParkMap
