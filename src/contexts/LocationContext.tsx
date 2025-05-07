import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationContextType {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  checkLocationPermission: () => Promise<boolean>;
  isWithinRange: (targetLat: number, targetLng: number, range: number) => boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return false;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    return true;
  };

  const isWithinRange = (targetLat: number, targetLng: number, range: number) => {
    if (!location) return false;

    const R = 6371; // Earth's radius in km
    const lat1 = location.coords.latitude * Math.PI / 180;
    const lat2 = targetLat * Math.PI / 180;
    const dLat = (targetLat - location.coords.latitude) * Math.PI / 180;
    const dLon = (targetLng - location.coords.longitude) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance <= range;
  };

  useEffect(() => {
    checkLocationPermission();
  }, []);

  return (
    <LocationContext.Provider value={{ location, errorMsg, checkLocationPermission, isWithinRange }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}