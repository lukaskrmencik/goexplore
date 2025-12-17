import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoute, updateRoute, calculateRoute, getJobProgress } from "../services/routesApiService";

interface Coordinates { coordinates: number[] }
interface Axis { coordinates: number[][]; type: "LineString" }
interface RouteData {
  name: string;
  start_date: string;
  end_date: string;
  start: Coordinates;
  end: Coordinates;
  max_route_length_day: number;
  poi_per_day: number;
  buffer_size: number;
  axis: Axis;
}

const cities = [
  { name: "Praha", coords: [14.4378, 50.0755] },
  { name: "Brno", coords: [16.6068, 49.1951] },
  { name: "Ostrava", coords: [18.2625, 49.8350] },
  { name: "Plzeň", coords: [13.3776, 49.7475] },
  { name: "Liberec", coords: [15.0562, 50.7671] },
  { name: "Olomouc", coords: [17.2518, 49.5938] },
  { name: "České Budějovice", coords: [14.4749, 48.9747] },
];

const CreateRoutePage: React.FC = () => {
  const navigate = useNavigate();

  const [routeData, setRouteData] = useState<RouteData>({
    name: "",
    start_date: "2026-08-08T08:30",
    end_date: "2026-08-10T18:00",
    start: { coordinates: cities[0].coords },
    end: { coordinates: cities[1].coords },
    max_route_length_day: 200,
    poi_per_day: 5,
    buffer_size: 10,
    axis: { coordinates: [], type: "LineString" },
  });

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof RouteData, value: any) => {
    setRouteData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleCityChange = (field: "start" | "end", value: string) => {
    const city = cities.find(c => c.name === value);
    if (city) {
      setRouteData(prev => ({ ...prev, [field]: { coordinates: city.coords } }));
    }
  };

  const formatDateForBackend = (value: string) => {
    const date = new Date(value);
    return date.toISOString().split('.')[0] + 'Z';
  };

  const handleCreate = async () => {
    if (!routeData.name.trim()) {
      setErrorMessage("Musíte vyplnit název trasy!");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const route = await createRoute();

      const generateAxis = (start: number[], end: number[]): number[][] => {
        const points: number[][] = [];
        for (let i = 0; i <= 8; i++) {
          const lng = start[0] + (end[0] - start[0]) * (i / 8);
          const lat = start[1] + (end[1] - start[1]) * (i / 8);
          points.push([lng, lat]);
        }
        return points;
      };

      const payload = {
        name: routeData.name,
        start: { coordinates: routeData.start.coordinates },
        end: { coordinates: routeData.end.coordinates },
        start_date: formatDateForBackend(routeData.start_date),
        end_date: formatDateForBackend(routeData.end_date),
        max_route_length_day: routeData.max_route_length_day,
        poi_per_day: routeData.poi_per_day,
        buffer_size: routeData.buffer_size,
        axis: {
          coordinates: generateAxis(routeData.start.coordinates, routeData.end.coordinates),
          type: "LineString",
        }
      };

      console.log("Odesílám payload:", payload);

      const response: any = await updateRoute(route.id, payload);

      if (response && response.status !== "success") {
        throw new Error(`Chyba backendu: ${response.message || "Neznámá chyba při ukládání trasy."}`);
      }

      const jobId = await calculateRoute(route.id);

      const interval = setInterval(async () => {
        const data = await getJobProgress(jobId);
        setProgress(data.progress);
        
        if (data.status === "failed") {
            clearInterval(interval);
            setLoading(false);
            setErrorMessage("Výpočet trasy selhal.");
        }

        if (data.status === "done") {
          clearInterval(interval);
          navigate(`/map-editor?id=${route.id}`);
        }
      }, 1000);

    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Došlo k neočekávané chybě.");
      setLoading(false);
    }
  };


  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Vytvořit trasu</h2>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <div className="mb-3">
        <label className="block mb-1 font-medium">Název trasy <span className="text-red-500">*</span></label>
        <input 
          className={`w-full border rounded px-2 py-1 ${!routeData.name && errorMessage ? "border-red-500" : ""}`} 
          value={routeData.name} 
          onChange={e => handleChange("name", e.target.value)} 
          placeholder="Zadejte název..."
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">Start město</label>
        <select className="w-full border rounded px-2 py-1" value={cities.find(c => c.coords.toString() === routeData.start.coordinates.toString())?.name} onChange={e => handleCityChange("start", e.target.value)}>
          {cities.map(city => <option key={city.name} value={city.name}>{city.name}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">Konec město</label>
        <select className="w-full border rounded px-2 py-1" value={cities.find(c => c.coords.toString() === routeData.end.coordinates.toString())?.name} onChange={e => handleCityChange("end", e.target.value)}>
          {cities.map(city => <option key={city.name} value={city.name}>{city.name}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">Start date</label>
        <input type="datetime-local" className="w-full border rounded px-2 py-1" value={routeData.start_date} onChange={e => handleChange("start_date", e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">End date</label>
        <input type="datetime-local" className="w-full border rounded px-2 py-1" value={routeData.end_date} onChange={e => handleChange("end_date", e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">Max route length per day</label>
        <input type="number" className="w-full border rounded px-2 py-1" value={routeData.max_route_length_day} onChange={e => handleChange("max_route_length_day", Number(e.target.value))} />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">POI per day</label>
        <input type="number" className="w-full border rounded px-2 py-1" value={routeData.poi_per_day} onChange={e => handleChange("poi_per_day", Number(e.target.value))} />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">Buffer size</label>
        <input type="number" className="w-full border rounded px-2 py-1" value={routeData.buffer_size} onChange={e => handleChange("buffer_size", Number(e.target.value))} />
      </div>

      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50" onClick={handleCreate} disabled={loading}>
        {loading ? "Pracuji..." : "Vytvořit a spočítat trasu"}
      </button>

      {progress !== null && <p className="mt-3 font-medium text-blue-600">Výpočet: {progress} %</p>}
    </div>
  );
};

export default CreateRoutePage;