import { ParkingZone, ParkingSlot, Destination } from '../types/parking';

export const defaultDestinations: Destination[] = [
  {
    id: 'a20',
    name: 'Gedung A20 (GKB A20)',
    shortName: 'Gedung A20',
    category: 'gedung',
    description: 'Gedung Kuliah Bersama A20'
  },
  {
    id: 'a19',
    name: 'Gedung A19 (GKB A19)',
    shortName: 'Gedung A19',
    category: 'gedung',
    description: 'Gedung Kuliah Bersama A19'
  },
  {
    id: 'teknik',
    name: 'Fakultas Teknik (FT)',
    shortName: 'Fak. Teknik',
    category: 'fakultas',
    description: 'Area Fakultas Teknik'
  },
  {
    id: 'fis',
    name: 'Fakultas Ilmu Sosial (FIS)',
    shortName: 'Fak. FIS',
    category: 'fakultas',
    description: 'Area Fakultas FIS'
  },
  {
    id: 'mipa',
    name: 'Fakultas MIPA (FMIPA)',
    shortName: 'Fak. MIPA',
    category: 'fakultas',
    description: 'Area Fakultas Matematika & IPA'
  },
  {
    id: 'perpus',
    name: 'Perpustakaan Pusat',
    shortName: 'Perpustakaan',
    category: 'fasilitas',
    description: 'Gedung Perpustakaan'
  }
];

const generateSlots = (zoneId: string, occupiedSlotIds: number[]): ParkingSlot[] => {
  const slots: ParkingSlot[] = [];
  for (let i = 1; i <= 16; i++) {
    const isOccupied = occupiedSlotIds.includes(i);
    slots.push({
      id: i,
      code: `${i}`,
      isOccupied: isOccupied,
      lastUpdated: isOccupied ? `${Math.floor(Math.random() * 25) + 5} menit lalu` : 'Tersedia',
      distanceCm: isOccupied ? Math.floor(Math.random() * 20) + 10 : 160,
      sensorType: 'ultrasonic'
    });
  }
  return slots;
};

export const defaultZones: ParkingZone[] = [
  {
    id: 'A19-DEP',
    name: 'GKB A19 Depan',
    description: 'Paling dekat dengan Gedung A19 dan Gedung A20',
    totalSlots: 16,
    slots: generateSlots('A19-DEP', [2, 5, 8, 11, 14]), // 5 terisi, 11 kosong
    distances: {
      a19: { meters: 30, walkingMinutes: 1, proximityLevel: 'closest', note: 'Paling Dekat (~30 m)' },
      a20: { meters: 50, walkingMinutes: 1, proximityLevel: 'closest', note: 'Paling Dekat (~50 m)' },
      fis: { meters: 240, walkingMinutes: 3, proximityLevel: 'far', note: 'Jarak Sedang (~240 m)' },
      teknik: { meters: 320, walkingMinutes: 4, proximityLevel: 'far', note: 'Lebih Jauh (~320 m)' },
      mipa: { meters: 380, walkingMinutes: 5, proximityLevel: 'far', note: 'Lebih Jauh (~380 m)' },
      perpus: { meters: 280, walkingMinutes: 4, proximityLevel: 'far', note: 'Jarak Sedang (~280 m)' }
    }
  },
  {
    id: 'A19-BLK',
    name: 'GKB A19 Belakang',
    description: 'Paling dekat dengan Gedung A19 dan agak dekat dengan Gedung A20',
    totalSlots: 16,
    slots: generateSlots('A19-BLK', [1, 3, 6, 9, 12, 15]), // 6 terisi, 10 kosong
    distances: {
      a19: { meters: 40, walkingMinutes: 1, proximityLevel: 'closest', note: 'Paling Dekat (~40 m)' },
      a20: { meters: 120, walkingMinutes: 2, proximityLevel: 'moderate', note: 'Agak Dekat (~120 m)' },
      fis: { meters: 260, walkingMinutes: 4, proximityLevel: 'far', note: 'Jarak Sedang (~260 m)' },
      teknik: { meters: 350, walkingMinutes: 5, proximityLevel: 'far', note: 'Lebih Jauh (~350 m)' },
      mipa: { meters: 420, walkingMinutes: 5, proximityLevel: 'far', note: 'Lebih Jauh (~420 m)' },
      perpus: { meters: 300, walkingMinutes: 4, proximityLevel: 'far', note: 'Lebih Jauh (~300 m)' }
    }
  },
  {
    id: 'A20-BLK',
    name: 'GKB A20 Belakang',
    description: 'Paling dekat dengan Gedung A20 dan agak dekat dengan Gedung A19',
    totalSlots: 16,
    slots: generateSlots('A20-BLK', [4, 7, 10]), // 3 terisi, 13 kosong
    distances: {
      a20: { meters: 40, walkingMinutes: 1, proximityLevel: 'closest', note: 'Paling Dekat (~40 m)' },
      a19: { meters: 130, walkingMinutes: 2, proximityLevel: 'moderate', note: 'Agak Dekat (~130 m)' },
      fis: { meters: 280, walkingMinutes: 4, proximityLevel: 'far', note: 'Jarak Sedang (~280 m)' },
      teknik: { meters: 360, walkingMinutes: 5, proximityLevel: 'far', note: 'Lebih Jauh (~360 m)' },
      mipa: { meters: 430, walkingMinutes: 6, proximityLevel: 'far', note: 'Lebih Jauh (~430 m)' },
      perpus: { meters: 310, walkingMinutes: 4, proximityLevel: 'far', note: 'Lebih Jauh (~310 m)' }
    }
  },
  {
    id: 'FIS-KNT',
    name: 'Kantin FIS',
    description: 'Paling dekat dengan Fakultas FIS, agak dekat dengan Fakultas Teknik',
    totalSlots: 16,
    slots: generateSlots('FIS-KNT', [1, 2, 5, 8, 11, 13, 14]), // 7 terisi, 9 kosong
    distances: {
      fis: { meters: 35, walkingMinutes: 1, proximityLevel: 'closest', note: 'Paling Dekat (~35 m)' },
      teknik: { meters: 130, walkingMinutes: 2, proximityLevel: 'moderate', note: 'Agak Dekat (~130 m)' },
      perpus: { meters: 190, walkingMinutes: 3, proximityLevel: 'moderate', note: 'Jarak Sedang (~190 m)' },
      a19: { meters: 250, walkingMinutes: 3, proximityLevel: 'far', note: 'Jarak Sedang (~250 m)' },
      a20: { meters: 290, walkingMinutes: 4, proximityLevel: 'far', note: 'Lebih Jauh (~290 m)' },
      mipa: { meters: 310, walkingMinutes: 4, proximityLevel: 'far', note: 'Lebih Jauh (~310 m)' }
    }
  },
  {
    id: 'B12',
    name: 'Area Parkir B12',
    description: 'Paling dekat dengan Fakultas Teknik dan agak dekat dengan Perpustakaan',
    totalSlots: 16,
    slots: generateSlots('B12', [3, 6, 7, 10, 12, 16]), // 6 terisi, 10 kosong
    distances: {
      teknik: { meters: 45, walkingMinutes: 1, proximityLevel: 'closest', note: 'Paling Dekat (~45 m)' },
      perpus: { meters: 110, walkingMinutes: 2, proximityLevel: 'moderate', note: 'Agak Dekat (~110 m)' },
      fis: { meters: 170, walkingMinutes: 2, proximityLevel: 'moderate', note: 'Jarak Sedang (~170 m)' },
      mipa: { meters: 210, walkingMinutes: 3, proximityLevel: 'moderate', note: 'Jarak Sedang (~210 m)' },
      a19: { meters: 310, walkingMinutes: 4, proximityLevel: 'far', note: 'Lebih Jauh (~310 m)' },
      a20: { meters: 330, walkingMinutes: 5, proximityLevel: 'far', note: 'Lebih Jauh (~330 m)' }
    }
  },
  {
    id: 'UM-MRT',
    name: 'Area Parkir UM Mart',
    description: 'Paling dekat dengan Fakultas Teknik dan agak dekat dengan Fakultas MIPA',
    totalSlots: 16,
    slots: generateSlots('UM-MRT', [2, 4, 8, 9, 13]), // 5 terisi, 11 kosong
    distances: {
      teknik: { meters: 55, walkingMinutes: 1, proximityLevel: 'closest', note: 'Paling Dekat (~55 m)' },
      mipa: { meters: 95, walkingMinutes: 1, proximityLevel: 'moderate', note: 'Agak Dekat (~95 m)' },
      perpus: { meters: 190, walkingMinutes: 3, proximityLevel: 'moderate', note: 'Jarak Sedang (~190 m)' },
      fis: { meters: 230, walkingMinutes: 3, proximityLevel: 'far', note: 'Jarak Sedang (~230 m)' },
      a19: { meters: 360, walkingMinutes: 5, proximityLevel: 'far', note: 'Lebih Jauh (~360 m)' },
      a20: { meters: 390, walkingMinutes: 5, proximityLevel: 'far', note: 'Lebih Jauh (~390 m)' }
    }
  }
];
