import { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export default function EquipmentList() {
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    api.get("/equipment/").then(res => setEquipment(res.data));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Equipment</h2>

      <ul>
        {equipment.map(eq => (
          <li key={eq.id}>
            <Link to={`/equipment/${eq.id}`}>
              {eq.name} ({eq.serial_number})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
