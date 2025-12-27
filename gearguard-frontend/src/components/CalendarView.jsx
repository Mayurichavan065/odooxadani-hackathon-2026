import { useState, useEffect } from "react";
import { USE_MOCK_API } from "../config";
import { mockRequests } from "../mockData";
import { api } from "../api";

export default function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (USE_MOCK_API) setEvents(mockRequests.filter(r => r.type === "PREVENTIVE"));
    else api.get("/calendar/").then(res => setEvents(res.data.filter(r => r.type === "PREVENTIVE")));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Preventive Maintenance Calendar</h2>
      <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {events.map(event => (
          <li key={event.id} className="bg-white p-3 rounded shadow hover:shadow-md transition">
            <div className="font-semibold text-gray-800">{event.subject}</div>
            <div className="text-sm text-gray-500">{event.scheduled_date}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
