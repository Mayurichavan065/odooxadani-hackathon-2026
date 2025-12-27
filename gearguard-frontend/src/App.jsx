import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import KanbanBoard from "./components/KanbanBoard";
import CalendarView from "./components/CalendarView";
import EquipmentList from "./components/EquipmentList";
import EquipmentDetail from "./components/EquipmentDetail";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 16 }}>
        <Link to="/kanban">Kanban</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/equipment">Equipment</Link>
      </nav>

      <Routes>
        <Route path="/" element={<KanbanBoard />} />
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/equipment" element={<EquipmentList />} />
        <Route path="/equipment/:id" element={<EquipmentDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
