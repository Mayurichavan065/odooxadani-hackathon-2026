import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { api } from "../api";
import KanbanColumn from "./KanbanColumn";

const STATUSES = ["NEW", "IN_PROGRESS", "REPAIRED", "SCRAP"];

export default function KanbanBoard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get("/requests/")
      .then(res => {
        if (Array.isArray(res.data)) {
          setRequests(res.data);
        } else {
          setRequests([]);
        }
      })
      .catch(() => {
        // MOCK DATA (frontend-only mode)
        setRequests([
          {
            id: 1,
            subject: "Printer not working",
            status: "NEW",
            equipment_name: "Printer 01",
            scheduled_date: "2024-01-01",
            assigned_to: { name: "Alex" },
          },
          {
            id: 2,
            subject: "Oil leakage",
            status: "IN_PROGRESS",
            equipment_name: "CNC Machine",
            scheduled_date: "2023-12-01",
            assigned_to: { name: "Sam" },
          },
          {
            id: 3,
            subject: "Routine check",
            status: "REPAIRED",
            equipment_name: "Generator",
            scheduled_date: "2023-11-20",
            assigned_to: { name: "John" },
          },
        ]);
      });
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const requestId = result.draggableId;
    const newStatus = result.destination.droppableId;

    setRequests(prev =>
      prev.map(r =>
        String(r.id) === requestId ? { ...r, status: newStatus } : r
      )
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Maintenance Kanban</h2>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: 16 }}>
          {STATUSES.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              requests={
                Array.isArray(requests)
                  ? requests.filter(r => r.status === status)
                  : []
              }
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
