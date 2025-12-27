import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { USE_MOCK_API } from "../config";
import { api } from "../api";
import { mockRequests, mockEquipment } from "../mockData";

export default function EquipmentDetail() {
  const { id } = useParams();
  const [requests, setRequests] = useState([]);
  const equipment = USE_MOCK_API
    ? mockEquipment.find(e => e.id === Number(id))
    : null;

  useEffect(() => {
    if (USE_MOCK_API) {
      setRequests(mockRequests.filter(r => r.equipment_id === Number(id)));
    } else {
      api.get(`/equipment/${id}/requests/`).then(res => setRequests(res.data));
    }
  }, [id]);

  const openCount = requests.filter(r => r.status !== "REPAIRED").length;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{equipment?.name || `Equipment #${id}`}</h2>

      <button className="bg-green-600 text-white px-3 py-1 rounded mb-4">
        Maintenance ({openCount})
      </button>

      <ul className="space-y-2">
        {requests.map(r => (
          <li key={r.id} className="bg-white p-3 rounded shadow">
            <div className="font-semibold">{r.subject}</div>
            <div className="text-sm text-gray-500">{r.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
