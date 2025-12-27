import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import KanbanBoard from "./components/KanbanBoard";
import EquipmentList from "./components/EquipmentList";
import EquipmentDetail from "./components/EquipmentDetail";
import CalendarView from "./components/CalendarView";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/equipment" element={<EquipmentList />} />
        <Route path="/equipment/:id" element={<EquipmentDetail />} />
        <Route path="/calendar" element={<CalendarView />} />
      </Routes>
    </Router>
  );
}
