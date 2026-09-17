// src/services/shelter.service.ts
// Offline emergency shelter coordinates & directional compass service

export interface ShelterFacility {
  id: string;
  name: string;
  type: 'cyclone_shelter' | 'hospital' | 'community_hall' | 'relief_camp';
  address: string;
  distanceKm: number;
  bearingDeg: number;
  capacity: number;
  currentOccupancy: number;
  hasPower: boolean;
  hasMedical: boolean;
  contact: string;
}

export class ShelterService {
  static getNearbyShelters(cityName: string = 'New Delhi'): ShelterFacility[] {
    const isCoastal = cityName.toLowerCase().includes('mumbai') || cityName.toLowerCase().includes('chennai') || cityName.toLowerCase().includes('puri');
    
    return [
      {
        id: 'sh-1',
        name: isCoastal ? 'Coastal Disaster Relief Cyclone Shelter #12' : 'District Emergency Relief Camp (Community Center)',
        type: isCoastal ? 'cyclone_shelter' : 'relief_camp',
        address: 'Sector 4 Disaster Zone Safe Enclave',
        distanceKm: 1.2,
        bearingDeg: 45, // NE
        capacity: 1200,
        currentOccupancy: 340,
        hasPower: true,
        hasMedical: true,
        contact: '1077 / 011-23456789'
      },
      {
        id: 'sh-2',
        name: 'Government Multi-Specialty General Hospital',
        type: 'hospital',
        address: 'Main Health Corridor, Gate #3',
        distanceKm: 2.8,
        bearingDeg: 135, // SE
        capacity: 800,
        currentOccupancy: 520,
        hasPower: true,
        hasMedical: true,
        contact: '102 / 108'
      },
      {
        id: 'sh-3',
        name: 'Red Cross Flood Resiliency Shelter Center',
        type: 'community_hall',
        address: 'High-Ground Elevated Sports Complex',
        distanceKm: 4.1,
        bearingDeg: 280, // WNW
        capacity: 2500,
        currentOccupancy: 610,
        hasPower: true,
        hasMedical: true,
        contact: '1800-112-233'
      }
    ];
  }

  static getDirectionLabel(bearing: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(bearing / 45) % 8;
    return directions[idx];
  }
}
