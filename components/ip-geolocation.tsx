"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Circle, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


interface GeolocationData {
  query: string;
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
}

const IPGeolocation: React.FC = () => {
  const [data, setData] = useState<GeolocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGeolocation = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const response = await fetch("http://ip-api.com/json");
      if (!response.ok) {
        throw new Error("La respuesta de la red no fue correcta");
      }
      const result: GeolocationData = await response.json();
      if (result.status === 'fail') {
        throw new Error("No se pudo obtener la geolocalización de la IP.");
      }
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Geolocalización por IP
      </h2>
      <button
        onClick={fetchGeolocation}
        disabled={loading}
        className="w-full px-4 py-2 mb-4 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Obteniendo..." : "Obtener mi Ubicación por IP"}
      </button>

      {error && (
        <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-400 rounded-md">
          <p>Error: {error}</p>
        </div>
      )}

      {data && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Información de IP:</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>IP:</strong> {data.query}</li>
              <li><strong>País:</strong> {data.country} ({data.countryCode})</li>
              <li><strong>Región:</strong> {data.regionName} ({data.region})</li>
              <li><strong>Ciudad:</strong> {data.city}</li>
              <li><strong>Zona Horaria:</strong> {data.timezone}</li>
              <li><strong>ISP:</strong> {data.isp}</li>
              <li><strong>Organización:</strong> {data.org}</li>
            </ul>
          </div>
          <div className="h-64 md:h-auto rounded-lg overflow-hidden">
            <MapContainer center={[data.lat, data.lon]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Circle center={[data.lat, data.lon]} radius={500}>
                <Tooltip>
                  Ubicación aproximada de tu IP.
                </Tooltip>
              </Circle>
            </MapContainer>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default IPGeolocation;
