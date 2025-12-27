import { useState } from "react";
import { USE_MOCK_API } from "../config";
import { api } from "../api";
import { mockEquipment } from "../mockData";

export default function CreateRequestModal({ onClose, onCreated }) {
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("CORRECTIVE");
  const [equipmentId, setEquipmentId] = useState(mockEquipment[0]?.id || 1);

  const handleCreate = () => {
    const newRequest = {
      id: Date.now(),
      subject,
      type,
      status: "NEW",
      equipment_id: equipmentId,
      equipment_name: mockEquipment.find(e => e.id === equipmentId)?.name,
      scheduled_date: null,
      assigned_to: null,
    };

    if (USE_MOCK_API) {
      onCreated(newRequest);
      onClose();
    } else {
      api.post("/requests/", newRequest).then(res => {
        onCreated(res.data);
        onClose();
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-96 shadow-lg">
        <h2 className="text-lg font-bold mb-4">New Maintenance Request</h2>

        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Subject"
          className="border p-2 w-full mb-3 rounded"
        />

        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        >
          <option value="CORRECTIVE">Corrective</option>
          <option value="PREVENTIVE">Preventive</option>
        </select>

        <select
          value={equipmentId}
          onChange={e => setEquipmentId(Number(e.target.value))}
          className="border p-2 w-full mb-4 rounded"
        >
          {mockEquipment.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1">Cancel</button>
          <button
            onClick={handleCreate}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
