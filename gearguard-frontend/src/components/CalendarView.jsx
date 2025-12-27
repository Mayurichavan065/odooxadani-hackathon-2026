import { useEffect, useState } from "react";
import { api } from "../api";

export default function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/calendar/").then(res => setEvents(res.data));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Preventive Maintenance Calendar</h2>

      <ul>
        {events.map(event => (
          <li key={event.id}>
            <strong>{event.scheduled_date}</strong> — {event.subject}
          </li>
        ))}
      </ul>
    </div>
  );
}
