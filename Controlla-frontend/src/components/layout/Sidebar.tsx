import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Clock,
  DollarSign,
  BarChart,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem = ({ to, icon, label, active }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`
        flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
        ${
          active
            ? "bg-primary-50 text-primary-700 font-medium"
            : "text-gray-600 hover:bg-gray-100"
        }
      `}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const { pathname } = useLocation();
  // const { logout, user } = useAuth();

  const navItems = [
    {
      to: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
    },
    { to: "/contractors", icon: <Users size={20} />, label: "Contractors" },
    { to: "/projects", icon: <FolderKanban size={20} />, label: "Projects" },
    { to: "/time-tracking", icon: <Clock size={20} />, label: "Time Tracking" },
    { to: "/finance", icon: <DollarSign size={20} />, label: "Finance" },
    { to: "/reports", icon: <BarChart size={20} />, label: "Reports" },
    { to: "/messages", icon: <MessageSquare size={20} />, label: "Messages" },
  ];

  // return (
  //   // <aside className="hidden md:flex flex-col bg-white border-r border-gray-200 w-64 h-screen sticky top-0 overflow-y-auto">
  //   //   <div className="p-5 border-b border-gray-200">
  //   //     <div className="flex items-center space-x-2">
  //   //       <div className="bg-primary-600 text-white p-1.5 rounded">
  //   //         <Clock size={22} />
  //   //       </div>
  //   //       <span className="text-xl font-bold text-gray-900">Controlla</span>
  //   //     </div>
  //   //   </div>

  //   //   <div className="flex flex-col justify-between flex-1 py-5">
  //   //     <nav className="px-3 space-y-1">
  //   //       {navItems.map((item) => (
  //   //         <NavItem
  //   //           key={item.to}
  //   //           to={item.to}
  //   //           icon={item.icon}
  //   //           label={item.label}
  //   //           active={pathname === item.to}
  //   //         />
  //   //       ))}
  //   //     </nav>

  //   //     <div className="px-3 mt-auto">
  //   //       <NavItem
  //   //         to="/settings"
  //   //         icon={<Settings size={20} />}
  //   //         label="Settings"
  //   //         active={pathname === '/settings'}
  //   //       />

  //   //       <button
  //   //         onClick={logout}
  //   //         className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors mt-1"
  //   //       >
  //   //         <LogOut size={20} />
  //   //         <span>Logout</span>
  //   //       </button>

  //   //       <div className="flex items-center space-x-3 mt-5 px-3 py-3 border-t border-gray-200">
  //   //         {user?.avatar ? (
  //   //           <img
  //   //             src={user.avatar}
  //   //             alt={user.name}
  //   //             className="w-9 h-9 rounded-full object-cover"
  //   //           />
  //   //         ) : (
  //   //           <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
  //   //             {user?.name ? user.name.charAt(0) : '?'}
  //   //           </div>
  //   //         )}
  //   //         <div className="flex-1 min-w-0">
  //   //           <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
  //   //           <p className="text-xs text-gray-500 truncate">{user?.email}</p>
  //   //           <p className="text-xs text-primary-600 font-medium capitalize truncate">
  //   //             {user?.role?.replace('_', ' ')}
  //   //           </p>
  //   //         </div>
  //   //       </div>
  //   //     </div>
  //   //   </div>
  //   // </aside>
  // );
};

export default Sidebar;
