import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import KanbanColumn from "./KanbanColumn";
import CreateRequestModal from "./CreateRequestModal";
import { mockRequests } from "../mockData";
import { USE_MOCK_API } from "../config";
import { api } from "../api";

const STATUSES = ["NEW", "IN_PROGRESS", "REPAIRED", "SCRAP"];

export default function KanbanBoard() {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (USE_MOCK_API) {
      setRequests(mockRequests);
    } else {
      api.get("/requests/").then(res => setRequests(res.data));
    }
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    setRequests(prev =>
      prev.map(r =>
        String(r.id) === result.draggableId
          ? { ...r, status: result.destination.droppableId }
          : r
      )
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Maintenance Kanban</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          + New Request
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4">
          {STATUSES.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              requests={requests.filter(r => r.status === status)}
            />
          ))}
        </div>
      </DragDropContext>

      {showModal && (
        <CreateRequestModal
          onClose={() => setShowModal(false)}
          onCreate={(data) => {
            setRequests(prev => [
              ...prev,
              {
                id: Date.now(),
                subject: data.subject || "New Request",
                status: "NEW",
                equipment_name: "Unknown",
              },
            ]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
