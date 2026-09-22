// src/services/network.service.ts
// Online and offline detection with simulation, custom event dispatching, and state management

const SIMULATED_OFFLINE_KEY = 'mausam_simulated_offline';

export class NetworkService {
  private static isSimulated: boolean = typeof window !== 'undefined' ? localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true' : false;
  private static isNativeOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  static init(): void {
    if (typeof window === 'undefined') return;

    this.isNativeOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.isSimulated = localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';

    window.addEventListener('online', () => {
      this.isNativeOnline = true;
      this.notifyStateChange();
    });

    window.addEventListener('offline', () => {
      this.isNativeOnline = false;
      this.notifyStateChange();
    });

    // Re-check network status when app comes back to foreground
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const currentNav = typeof navigator !== 'undefined' ? navigator.onLine : true;
        if (currentNav !== this.isNativeOnline) {
          this.isNativeOnline = currentNav;
          this.notifyStateChange();
        }
      }
    });

    // Apply document level attribute
    this.updateDocumentAttributes();
  }

  static isOnline(): boolean {
    if (this.isSimulated) return false;
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  }

  static isOffline(): boolean {
    return !this.isOnline();
  }

  static isSimulatedOffline(): boolean {
    return this.isSimulated;
  }

  static setSimulatedOffline(offline: boolean): void {
    this.isSimulated = offline;
    if (typeof window !== 'undefined') {
      if (offline) {
        localStorage.setItem(SIMULATED_OFFLINE_KEY, 'true');
      } else {
        localStorage.removeItem(SIMULATED_OFFLINE_KEY);
      }
    }
    this.notifyStateChange();
  }

  static toggleOfflineSimulation(): boolean {
    this.setSimulatedOffline(!this.isSimulated);
    return this.isSimulated;
  }

  private static updateDocumentAttributes(): void {
    if (typeof document === 'undefined') return;
    const online = this.isOnline();
    if (online) {
      document.documentElement.removeAttribute('data-offline');
      document.body?.classList.remove('is-offline');
    } else {
      document.documentElement.setAttribute('data-offline', 'true');
      document.body?.classList.add('is-offline');
    }
  }

  public static notifyStateChange(): void {
    const online = this.isOnline();
    this.updateDocumentAttributes();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mausam-network-status-changed', {
        detail: {
          isOnline: online,
          isSimulated: this.isSimulated,
          isNativeOnline: this.isNativeOnline
        }
      }));
    }
  }
}

