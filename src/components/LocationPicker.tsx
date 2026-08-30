import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { LocationData } from '../types';
import toast from 'react-hot-toast';

interface LocationPickerProps {
  location: LocationData;
  onChange: (loc: LocationData) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ location, onChange }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [detectedSuccess, setDetectedSuccess] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setDetectedSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let detectedAddress = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° W (GPS Verified)`;

        // Try reverse geocoding via free public OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              detectedAddress = data.display_name.split(',').slice(0, 3).join(',');
            }
          }
        } catch (e) {
          // Fallback to coordinates
        }

        onChange({
          address: detectedAddress,
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
        });

        setIsLocating(false);
        setDetectedSuccess(true);
        toast.success('Location detected successfully!');
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        // Provide friendly default if permission denied or iframe sandboxed
        onChange({
          address: 'Downtown Civic Square, Metro District',
          latitude: 37.7749,
          longitude: -122.4194,
        });
        toast('Defaulted to Downtown Metro District', { icon: '📍' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
          Issue Location <span className="text-rose-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200/80 dark:border-blue-800/80 transition-all cursor-pointer shadow-2xs"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Detecting GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 text-blue-500" />
              <span>Use My Current Location</span>
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <MapPin className="w-4 h-4 text-rose-500" />
        </div>
        <input
          type="text"
          value={location.address}
          onChange={(e) => onChange({ ...location, address: e.target.value })}
          placeholder="e.g. 5th Avenue & Main Street, West Park"
          required
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Lat & Long Readouts */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Latitude:</span>
          <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{location.latitude || 37.7749}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Longitude:</span>
          <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{location.longitude || -122.4194}</span>
        </div>
      </div>
    </div>
  );
};
