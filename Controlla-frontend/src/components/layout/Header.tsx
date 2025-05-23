import { useState } from 'react';
import { Bell, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="text-gray-500 hover:text-gray-700 md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
        
        <div className="relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="search"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search..."
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="text-gray-500 hover:text-gray-700 relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-medium">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="Close notifications"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
                  <p className="text-sm font-medium">Contract deadline approaching</p>
                  <p className="text-xs text-gray-500 mt-1">John Smith's contract expires in 3 days</p>
                  <p className="text-xs text-gray-400 mt-2">10 min ago</p>
                </div>
                
                <div className="p-4 border-b border-gray-100 hover:bg-gray-50 bg-blue-50">
                  <p className="text-sm font-medium">New invoice received</p>
                  <p className="text-xs text-gray-500 mt-1">Invoice #INV-2023 for $1,200 from Alex Brown</p>
                  <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
                </div>
                
                <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
                  <p className="text-sm font-medium">Task completed</p>
                  <p className="text-xs text-gray-500 mt-1">Website redesign has been marked as complete</p>
                  <p className="text-xs text-gray-400 mt-2">Yesterday</p>
                </div>
              </div>
              
              <div className="p-3 text-center border-t border-gray-200">
                <Button variant="link" size="sm">View all notifications</Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
              {user?.name.charAt(0)}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;