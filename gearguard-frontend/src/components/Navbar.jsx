import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const links = [
    { name: "Home", path: "/" },
    { name: "Calendar", path: "/calendar" },
    { name: "Kanban", path: "/kanban" },
    { name: "Equipment", path: "/equipment" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 font-bold text-xl text-gray-800">GearGuard</div>

          <div className="hidden md:flex space-x-6">
            {links.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-md font-medium ${
                  location.pathname === link.path
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-200"
                } transition`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
