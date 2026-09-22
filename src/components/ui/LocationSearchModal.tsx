import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  MapPin,
  Crosshair,
  Sparkles,
  Clock,
  Trash2,
  ChevronRight,
  Loader2,
  Globe2,
  Navigation,
  Compass,
  Building2,
  Cpu,
  Tractor,
  WifiOff
} from 'lucide-react';
import {
  searchLocationsAsync,
  detectUserLocation,
  saveSearchedLocation,
  getCachedSearchedLocations,
  type GeocodingResult
} from '../../services/geocoding.service';
import { PREPOPULATED_OFFLINE_LOCATIONS } from '../../data/offline-locations';
import { StorageService } from '../../services/storage.service';
import { NetworkService } from '../../services/network.service';

export interface PopularDestination {
  name: string;
  region: string;
  country: string;
  key: string;
  tag?: string;
  lat: number;
  lon: number;
  category?: string;
}

const POPULAR_DESTINATIONS: PopularDestination[] = [
  { name: 'Greater Noida', region: 'Uttar Pradesh', country: 'India', key: 'greater_noida', tag: 'Tech Hub', lat: 28.47, lon: 77.50, category: 'Tech Hub' },
  { name: 'New Delhi', region: 'Delhi', country: 'India', key: 'new_delhi', tag: 'Capital', lat: 28.61, lon: 77.20, category: 'Capital' },
  { name: 'Bengaluru', region: 'Karnataka', country: 'India', key: 'bengaluru', tag: 'Tech Hub', lat: 12.97, lon: 77.59, category: 'Tech Hub' },
  { name: 'Mumbai', region: 'Maharashtra', country: 'India', key: 'mumbai', tag: 'Metro', lat: 19.07, lon: 72.87, category: 'Metro' },
  { name: 'Hyderabad', region: 'Telangana', country: 'India', key: 'hyderabad', tag: 'Tech Hub', lat: 17.38, lon: 78.48, category: 'Tech Hub' },
  { name: 'Lucknow', region: 'Uttar Pradesh', country: 'India', key: 'lucknow', tag: 'Capital', lat: 26.84, lon: 80.94, category: 'Capital' },
  { name: 'Jaipur', region: 'Rajasthan', country: 'India', key: 'jaipur', tag: 'Heritage', lat: 26.91, lon: 75.78, category: 'Capital' },
  { name: 'Chennai', region: 'Tamil Nadu', country: 'India', key: 'chennai', tag: 'Coastal', lat: 13.08, lon: 80.27, category: 'Metro' },
  { name: 'London', region: 'Greater London', country: 'United Kingdom', key: 'london', tag: 'Global', lat: 51.50, lon: -0.12, category: 'Global' }
];

export interface LocationSearchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectLocation?: (location: { key: string; display: string; lat?: number; lon?: number }) => void;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen: initialIsOpen = false,
  onClose,
  onSelectLocation
}) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [cachedSearches, setCachedSearches] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const [activeSelectionIndex, setActiveSelectionIndex] = useState<number>(-1);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [isOffline, setIsOffline] = useState(!NetworkService.isOnline());

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Sync with prop if provided
  useEffect(() => {
    setIsOpen(initialIsOpen);
  }, [initialIsOpen]);

  // Load offline cached searches from localStorage & IndexedDB
  const refreshCachedSearches = () => {
    try {
      const cached = getCachedSearchedLocations();
      setCachedSearches(cached.slice(0, 6));
    } catch {
      setCachedSearches([]);
    }
  };

  useEffect(() => {
    refreshCachedSearches();
    setIsOffline(!NetworkService.isOnline());
  }, [isOpen]);

  // Listen to network status changes
  useEffect(() => {
    const handleNetworkChange = (e: any) => {
      setIsOffline(!e.detail?.isOnline);
    };
    window.addEventListener('mausam-network-status-changed', handleNetworkChange);
    return () => window.removeEventListener('mausam-network-status-changed', handleNetworkChange);
  }, []);

  // Listen to external window custom events from anywhere in the app
  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true);
      refreshCachedSearches();
      setIsOffline(!NetworkService.isOnline());
    };

    const handleCloseModal = () => {
      setIsOpen(false);
    };

    window.addEventListener('mausam-open-search-modal', handleOpenModal);
    window.addEventListener('mausam-close-search-modal', handleCloseModal);

    return () => {
      window.removeEventListener('mausam-open-search-modal', handleOpenModal);
      window.removeEventListener('mausam-close-search-modal', handleCloseModal);
    };
  }, []);

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Keyboard navigation & Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSelectionIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSelectionIndex(prev => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter') {
        if (activeSelectionIndex >= 0 && results[activeSelectionIndex]) {
          e.preventDefault();
          selectLocationResult(results[activeSelectionIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, activeSelectionIndex]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSearchFeedback(null);
    setActiveSelectionIndex(-1);
    onClose?.();
    window.dispatchEvent(new CustomEvent('mausam-search-modal-closed'));
  };

  // Perform debounced live geocoding with intelligent offline fallback
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveSelectionIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setResults([]);
      setIsLoading(false);
      setSearchFeedback(null);
      return;
    }

    setIsLoading(true);
    setSearchFeedback(null);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const data = await searchLocationsAsync(val.trim());
        setResults(data);
        if (!data || data.length === 0) {
          setSearchFeedback(`No matching cities found for "${val.trim()}"`);
        }
      } catch (err) {
        setResults([]);
        setSearchFeedback('Search failed. Using offline pre-bundled database.');
      } finally {
        setIsLoading(false);
      }
    }, 180);
  };

  const clearInput = () => {
    setQuery('');
    setResults([]);
    setSearchFeedback(null);
    setActiveSelectionIndex(-1);
    inputRef.current?.focus();
  };

  const selectLocationResult = (loc: GeocodingResult) => {
    const cityName = loc.name;
    const cleanKey = cityName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const display = loc.display || `${loc.name}, ${loc.region ? `${loc.region}, ` : ''}${loc.country}`;

    // Persist to offline cache and storage across LocalStorage and IndexedDB
    saveSearchedLocation({
      ...loc,
      display
    });
    StorageService.setLastLocation(display, cleanKey);
    StorageService.addSavedLocation(display);

    // Dispatch global events for app sync
    window.dispatchEvent(
      new CustomEvent('mausam-location-selected', {
        detail: { key: cleanKey, display, lat: loc.lat, lon: loc.lon }
      })
    );
    window.dispatchEvent(
      new CustomEvent('mausam-location-changed', {
        detail: { key: cleanKey, display, lat: loc.lat, lon: loc.lon }
      })
    );

    onSelectLocation?.({
      key: cleanKey,
      display,
      lat: loc.lat,
      lon: loc.lon
    });

    handleClose();
  };

  const selectPopularDestination = (dest: PopularDestination) => {
    const display = `${dest.name}, ${dest.region ? `${dest.region}, ` : ''}${dest.country}`;
    const resultItem: GeocodingResult = {
      id: `dest-${dest.key}`,
      name: dest.name,
      region: dest.region,
      country: dest.country,
      lat: dest.lat,
      lon: dest.lon,
      display,
      category: dest.category
    };

    saveSearchedLocation(resultItem);
    StorageService.setLastLocation(display, dest.key);
    StorageService.addSavedLocation(display);

    window.dispatchEvent(
      new CustomEvent('mausam-location-selected', {
        detail: { key: dest.key, display, lat: dest.lat, lon: dest.lon }
      })
    );
    window.dispatchEvent(
      new CustomEvent('mausam-location-changed', {
        detail: { key: dest.key, display, lat: dest.lat, lon: dest.lon }
      })
    );

    onSelectLocation?.({
      key: dest.key,
      display,
      lat: dest.lat,
      lon: dest.lon
    });

    handleClose();
  };

  const handleGpsLocation = async () => {
    try {
      setIsGpsLocating(true);
      const loc = await detectUserLocation();

      StorageService.setLastLocation(loc.display, loc.key);
      StorageService.addSavedLocation(loc.display);

      window.dispatchEvent(
        new CustomEvent('mausam-location-selected', {
          detail: { key: loc.key, display: loc.display, lat: loc.lat, lon: loc.lon }
        })
      );
      window.dispatchEvent(
        new CustomEvent('mausam-location-changed', {
          detail: { key: loc.key, display: loc.display, lat: loc.lat, lon: loc.lon }
        })
      );

      onSelectLocation?.({
        key: loc.key,
        display: loc.display,
        lat: loc.lat,
        lon: loc.lon
      });

      handleClose();
    } catch (err) {
      alert('Unable to acquire GPS coordinates. Please ensure location permissions are enabled.');
    } finally {
      setIsGpsLocating(false);
    }
  };

  const handleDeleteCachedLocation = (e: React.MouseEvent, locDisplay: string) => {
    e.stopPropagation();
    StorageService.removeSavedLocation(locDisplay);
    refreshCachedSearches();
  };

  // Filtered list for pre-bundled location category pills
  const filteredOfflineLocations = PREPOPULATED_OFFLINE_LOCATIONS.filter(l => {
    if (activeCategoryFilter === 'All') return true;
    if (activeCategoryFilter === 'Capitals') return l.category === 'Capital';
    if (activeCategoryFilter === 'Tech Hubs') return l.category === 'Tech Hub';
    if (activeCategoryFilter === 'Districts') return l.category === 'District' || l.category === 'Agriculture Hub';
    if (activeCategoryFilter === 'Global') return l.category === 'Global';
    return true;
  }).slice(0, 12);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-xl transition-all duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Location search"
    >
      {/* Main Glassmorphic Modal / Bottom Sheet Box */}
      <div
        ref={modalContainerRef}
        className="w-full sm:max-w-[520px] bg-[#0B0F19]/98 border border-white/20 rounded-t-[28px] sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] z-[100000] backdrop-blur-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[86vh] animate-bottom-sheet sm:animate-modal-scale"
      >
        {/* Mobile Pull Drag Indicator */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
        </div>

        {/* 1. Header Top Bar */}
        <div className="px-5 pt-3.5 pb-3 border-b border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] shrink-0">
              <Compass className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  Search Location
                </h2>
                {isOffline && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> Offline DB
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`}></span>
                <span className="truncate">
                  {isOffline
                    ? 'Pre-populated 80+ city offline database & intelligent suggestions'
                    : 'Live geocoding & offline synchronized registry'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 active:scale-90"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Container with Smooth Scroll */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          
          {/* 2. Sleek Horizontal Search Input */}
          <div className="relative w-full">
            <div className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[#060A14] border border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-200">
              <Search className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search city, district, hub or region (e.g. Greater Noida, UP, Mumbai)..."
                autoComplete="off"
                spellCheck="false"
                className="w-full bg-transparent text-white text-sm placeholder:text-slate-500 focus:outline-none tracking-tight font-medium"
              />
              {isLoading && (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              )}
              {query && !isLoading && (
                <button
                  type="button"
                  onClick={clearInput}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  aria-label="Clear query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 3. GPS Quick Action Card */}
          <button
            type="button"
            onClick={handleGpsLocation}
            disabled={isGpsLocating}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-slate-900/60 hover:from-emerald-500/25 hover:via-cyan-500/20 hover:to-slate-900/90 border border-emerald-400/30 hover:border-emerald-400/60 transition-all duration-200 text-left flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(16,185,129,0.12)] cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
                {isGpsLocating ? (
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-300" />
                ) : (
                  <Crosshair className="w-5 h-5 text-emerald-300 animate-radar-ping" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Use My Current Location</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                    GPS
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                  {isGpsLocating
                    ? 'Acquiring high-accuracy satellite fix...'
                    : 'Instant precision coordinates & local telemetry'}
                </div>
              </div>
            </div>

            <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-emerald-500/20 flex items-center justify-center text-slate-400 group-hover:text-emerald-300 transition-colors shrink-0">
              <Navigation className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* 4. Active Geocoding / Fuzzy Fallback Results Section */}
          {query.trim().length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe2 className="w-3 h-3 text-cyan-400" /> Matches & Suggestions ({results.length})
                </span>
                {results.length > 0 && (
                  <span className="text-[10px] text-cyan-400 font-medium">Click to select</span>
                )}
              </div>

              {searchFeedback && results.length === 0 && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center text-xs text-slate-400">
                  {searchFeedback}
                </div>
              )}

              <div className="space-y-1.5 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                {results.map((loc, idx) => {
                  const isSelected = activeSelectionIndex === idx;
                  const isFuzzy = loc.matchType === 'fuzzy';
                  const isRegional = loc.matchType === 'regional';
                  const isFallback = loc.isFallback || loc.matchType === 'fallback';

                  return (
                    <button
                      key={loc.id || `${loc.name}-${idx}`}
                      type="button"
                      onClick={() => selectLocationResult(loc)}
                      className={`w-full p-3 rounded-2xl text-left flex items-center justify-between gap-3 border transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                          : isFallback
                          ? 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-400/30'
                          : 'bg-slate-900/60 hover:bg-slate-900 border-white/10 hover:border-cyan-400/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                          isFallback
                            ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                            : 'bg-white/5 border-white/10 text-cyan-400'
                        }`}>
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-semibold text-white truncate">
                              {loc.name}
                            </span>
                            {loc.category && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-300">
                                {loc.category}
                              </span>
                            )}
                            {isFallback && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
                                Suggested Fallback
                              </span>
                            )}
                            {isFuzzy && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold">
                                Did you mean?
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {loc.suggestionReason ? (
                              <span className="text-cyan-300/90 font-medium">{loc.suggestionReason} • </span>
                            ) : null}
                            {loc.region ? `${loc.region}, ` : ''}{loc.country}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-cyan-400 text-xs font-semibold flex items-center gap-0.5">
                          Select <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Pre-Populated Category Filter Bar (When Query is Empty) */}
          {query.trim().length === 0 && (
            <div className="space-y-3 pt-1">
              {/* Category Pills Header */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-cyan-400" /> Pre-Bundled Offline Hubs
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">80+ Locations</span>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {['All', 'Capitals', 'Tech Hubs', 'Districts', 'Global'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      activeCategoryFilter === cat
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of Offline Hubs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                {filteredOfflineLocations.map((dest) => (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => selectLocationResult(dest)}
                    className="p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 active:bg-cyan-950/40 border border-white/10 hover:border-cyan-400/40 transition-all duration-150 text-left flex items-center justify-between gap-1.5 cursor-pointer group active:scale-95 shadow-sm"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-cyan-200 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{dest.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate pl-4">
                        {dest.region}
                      </div>
                    </div>
                    {dest.category && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-medium shrink-0">
                        {dest.category}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. Recent & Cached Searches List */}
          {query.trim().length === 0 && cachedSearches.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-emerald-400" /> Recent & Persisted
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">Synced Offline</span>
              </div>

              <div className="space-y-1.5">
                {cachedSearches.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => selectLocationResult(item)}
                    className="p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-emerald-400/30 flex items-center justify-between gap-2 transition-all duration-150 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <MapPin className="w-3 h-3" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {item.region ? `${item.region}, ` : ''}{item.country}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/20 font-medium">
                        Cached
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCachedLocation(e, item.display)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* 7. Footer Status Bar */}
        <div className="px-5 py-2.5 bg-[#080C16] border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mausam Geocoding Telemetry • 80+ Pre-Cached Hubs</span>
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            Esc to close
          </div>
        </div>

      </div>
    </div>
  );
};

export default LocationSearchModal;
