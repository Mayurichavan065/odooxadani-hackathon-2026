import { useNavigate } from "react-router-dom";
import { CalendarIcon, ClipboardListIcon, DesktopComputerIcon } from "@heroicons/react/solid";

export default function Home() {
  const navigate = useNavigate();

  const items = [
    { name: "Calendar", path: "/calendar", color: "bg-blue-500", icon: CalendarIcon },
    { name: "Kanban", path: "/kanban", color: "bg-green-500", icon: ClipboardListIcon },
    { name: "Equipment", path: "/equipment", color: "bg-yellow-500", icon: DesktopComputerIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-10">GearGuard Dashboard</h1>
      
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 w-full max-w-5xl">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`${item.color} text-white p-8 rounded-lg shadow-lg hover:scale-105 transition transform flex flex-col items-center`}
            >
              <Icon className="w-10 h-10 mb-2" />
              <span className="text-xl font-semibold">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
