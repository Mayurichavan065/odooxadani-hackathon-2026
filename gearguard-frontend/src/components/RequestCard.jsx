import { Draggable } from "@hello-pangea/dnd";
import { isBefore } from "date-fns";

export default function RequestCard({ request, index }) {
  const isOverdue =
    request.scheduled_date &&
    isBefore(new Date(request.scheduled_date), new Date()) &&
    request.status !== "REPAIRED";

  return (
    <Draggable draggableId={String(request.id)} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            padding: 10,
            marginBottom: 8,
            background: "white",
            borderLeft: isOverdue ? "5px solid red" : "5px solid green",
            borderRadius: 4,
            ...provided.draggableProps.style,
          }}
        >
          <strong>{request.subject}</strong>
          <div>{request.equipment_name}</div>
          <small>{request.assigned_to?.name || "Unassigned"}</small>
        </div>
      )}
    </Draggable>
  );
}
