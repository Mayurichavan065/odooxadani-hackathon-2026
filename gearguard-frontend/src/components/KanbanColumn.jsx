import { Droppable } from "@hello-pangea/dnd";
import RequestCard from "./RequestCard";

export default function KanbanColumn({ status, requests }) {
  return (
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            width: 300,
            minHeight: 500,
            background: "#ecf0f1",
            padding: 8,
            borderRadius: 6,
          }}
        >
          <h3>{status}</h3>
          {requests.map((req, index) => (
            <RequestCard key={req.id} request={req} index={index} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
