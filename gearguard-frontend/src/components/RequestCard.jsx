import { Draggable } from "@hello-pangea/dnd";

export default function RequestCard({ request, index }) {
  const isOverdue = request.scheduled_date && new Date(request.scheduled_date) < new Date();

  return (
    <Draggable draggableId={String(request.id)} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-3 bg-white rounded shadow hover:shadow-lg transition cursor-pointer ${
            isOverdue ? "border-l-4 border-red-500" : ""
          }`}
        >
          <div className="font-semibold text-gray-800">{request.subject}</div>
          <div className="text-sm text-gray-500">
            {request.equipment_name} • {request.assigned_to?.name || "Unassigned"}
          </div>
          {request.scheduled_date && (
            <div className="text-xs text-gray-400 mt-1">Scheduled: {request.scheduled_date}</div>
          )}
        </div>
      )}
    </Draggable>
  );
}
