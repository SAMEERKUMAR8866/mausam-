// src/services/ble-mesh.service.ts
// Simulated/Web-Bluetooth Zero-Cellular Peer-to-Peer SOS Mesh Beacon

export interface MeshPeer {
  id: string;
  name: string;
  distanceMeters: number;
  rssi: number;
  lastSeen: number;
  batteryPct: number;
  isRelay: boolean;
}

export class BleMeshService {
  private static isBeaconActive: boolean = false;
  private static peers: MeshPeer[] = [];
  private static listeners: ((peers: MeshPeer[]) => void)[] = [];

  static startBeacon(): boolean {
    this.isBeaconActive = true;
    this.peers = [
      { id: 'relay-101', name: 'NDRF Relay Node Alpha', distanceMeters: 45, rssi: -62, lastSeen: Date.now(), batteryPct: 92, isRelay: true },
      { id: 'peer-408', name: 'Civil Defense Scout #4', distanceMeters: 110, rssi: -78, lastSeen: Date.now(), batteryPct: 74, isRelay: false },
      { id: 'peer-812', name: 'Mausam User Device', distanceMeters: 230, rssi: -86, lastSeen: Date.now(), batteryPct: 61, isRelay: false }
    ];
    this.notify();
    return true;
  }

  static stopBeacon(): void {
    this.isBeaconActive = false;
    this.peers = [];
    this.notify();
  }

  static isBroadcasting(): boolean {
    return this.isBeaconActive;
  }

  static getPeers(): MeshPeer[] {
    return this.peers;
  }

  static subscribe(fn: (peers: MeshPeer[]) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private static notify(): void {
    this.listeners.forEach(fn => fn(this.peers));
  }
}
