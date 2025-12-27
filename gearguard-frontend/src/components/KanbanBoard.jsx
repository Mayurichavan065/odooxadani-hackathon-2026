import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import KanbanColumn from "./KanbanColumn";
import CreateRequestModal from "./CreateRequestModal";
import { USE_MOCK_API } from "../config";
import { api } from "../api";
import { mockRequests } from "../mockData";

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

    const requestId = result.draggableId;
    const newStatus = result.destination.droppableId;

    if (USE_MOCK_API) {
      setRequests(prev =>
        prev.map(r =>
          String(r.id) === requestId ? { ...r, status: newStatus } : r
        )
      );
    } else {
      api.patch(`/requests/${requestId}/status/`, { status: newStatus })
        .then(() => {
          setRequests(prev =>
            prev.map(r =>
              String(r.id) === requestId ? { ...r, status: newStatus } : r
            )
          );
        });
    }
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
        <div className="flex gap-4 flex-wrap">
          {STATUSES.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              requests={Array.isArray(requests) ? requests.filter(r => r.status === status) : []}
            />
          ))}
        </div>
      </DragDropContext>

      {showModal && (
        <CreateRequestModal
          onClose={() => setShowModal(false)}
          onCreated={(newRequest) => setRequests(prev => [...prev, newRequest])}
        />
      )}
    </div>
  );
}
