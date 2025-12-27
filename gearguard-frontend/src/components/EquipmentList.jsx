import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { USE_MOCK_API } from "../config";
import { mockEquipment } from "../mockData";
import { api } from "../api";

export default function EquipmentList() {
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    if (USE_MOCK_API) {
      setEquipment(mockEquipment);
    } else {
      api.get("/equipment/").then(res => setEquipment(res.data));
    }
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Equipment</h2>

      <div className="grid gap-4">
        {equipment.map(eq => (
          <Link
            key={eq.id}
            to={`/equipment/${eq.id}`}
            className="bg-white p-4 rounded shadow hover:bg-gray-50"
          >
            <div className="font-semibold">{eq.name}</div>
            <div className="text-sm text-gray-500">
              {eq.serial_number} • {eq.department}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
