import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { USE_MOCK_API } from "../config";
import { mockEquipment } from "../mockData";
import { api } from "../api";

export default function EquipmentList() {
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    if (USE_MOCK_API) setEquipment(mockEquipment);
    else api.get("/equipment/").then(res => setEquipment(res.data));
  }, []);

  return (
    <div className="p-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {equipment.map(eq => (
        <Link
          key={eq.id}
          to={`/equipment/${eq.id}`}
          className="bg-white p-4 rounded shadow hover:shadow-lg transition flex flex-col gap-1"
        >
          <div className="font-semibold text-gray-800">{eq.name}</div>
          <div className="text-sm text-gray-500">{eq.serial_number}</div>
          <div className="text-sm text-gray-500">{eq.department}</div>
        </Link>
      ))}
    </div>
  );
}
