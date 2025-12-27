import { Droppable } from "@hello-pangea/dnd";
import RequestCard from "./RequestCard";

export default function KanbanColumn({ status, requests }) {
  return (
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="bg-gray-100 rounded p-2 w-72 min-h-[500px]"
        >
          <h3 className="font-semibold mb-2">{status}</h3>
          {requests.map((req, i) => (
            <RequestCard key={req.id} request={req} index={i} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
