import { useEffect, useState } from "react";
import { api } from "../api";
import { useParams } from "react-router-dom";

export default function EquipmentDetail() {
  const { id } = useParams();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get(`/equipment/${id}/requests/`).then(res => setRequests(res.data));
  }, [id]);

  const openCount = requests.filter(
    r => r.status !== "REPAIRED"
  ).length;

  return (
    <div style={{ padding: 16 }}>
      <h2>Equipment #{id}</h2>

      <button style={{ marginBottom: 16 }}>
        Maintenance ({openCount})
      </button>

      <ul>
        {requests.map(req => (
          <li key={req.id}>
            {req.subject} — {req.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
