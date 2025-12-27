import { Droppable } from "@hello-pangea/dnd";
import RequestCard from "./RequestCard";

export default function KanbanColumn({ status, requests }) {
  return (
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="bg-gray-100 rounded p-3 w-full md:w-72 flex-shrink-0 min-h-[500px] shadow-md"
        >
          <h3 className="font-semibold text-gray-700 mb-2">{status.replace("_", " ")}</h3>
          <div className="flex flex-col gap-2">
            {requests.map((req, i) => (
              <RequestCard key={req.id} request={req} index={i} />
            ))}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
