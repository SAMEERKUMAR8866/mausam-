// src/services/network.service.ts
// Online and offline detection with custom event dispatching

export class NetworkService {
  private static isOnlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  static init(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnlineStatus = true;
      this.notifyStateChange();
    });

    window.addEventListener('offline', () => {
      this.isOnlineStatus = false;
      this.notifyStateChange();
    });
  }

  static isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  }

  private static notifyStateChange(): void {
    const online = this.isOnline();
    window.dispatchEvent(new CustomEvent('mausam-network-status-changed', {
      detail: { isOnline: online }
    }));
  }
}
