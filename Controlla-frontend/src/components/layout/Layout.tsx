import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileSidebar from './MobileSidebar';

const Layout = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {showMobileSidebar && (
        <MobileSidebar onClose={() => setShowMobileSidebar(false)} />
      )}
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onToggleSidebar={toggleMobileSidebar} />
        
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;