import { X } from 'lucide-react';
import Sidebar from './Sidebar';

interface MobileSidebarProps {
  onClose: () => void;
}

const MobileSidebar = ({ onClose }: MobileSidebarProps) => {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-gray-900/50" onClick={onClose} />
      
      <div className="fixed left-0 top-0 bottom-0 w-full max-w-xs bg-white shadow-lg">
        <div className="absolute right-4 top-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>
        
        <Sidebar />
      </div>
    </div>
  );
};

export default MobileSidebar;