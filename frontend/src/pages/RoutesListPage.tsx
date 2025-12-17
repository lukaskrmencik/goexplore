import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserRoutes } from "../services/routesApiService";
import type { RouteItem } from "../types/routes";

const RoutesListPage: React.FC = () => {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRoutes = async () => {
      setLoading(true);
      try {
        const data = await fetchUserRoutes(1, 10);
        setRoutes(data.items);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    loadRoutes();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Moje trasy</h2>

      <button className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={() => navigate("/routes/new")}>
        Vytvořit novou trasu
      </button>

      {loading && <p>Načítám…</p>}

      <ul className="space-y-2">
        {routes.map(route => (
          <li
            key={route.id}
            className="p-2 border rounded cursor-pointer hover:bg-gray-100"
            onClick={() => navigate(`/map-editor?id=${route.id}`)}
          >
            <strong>{route.name}</strong> ({route.mode})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoutesListPage;
