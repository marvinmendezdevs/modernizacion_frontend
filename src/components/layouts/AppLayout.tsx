import {
  Menu,
  Bell
} from 'lucide-react';
import useAuth from '@/hooks/useAuth.hooks';
import AsideLayout from './AsideLayout';
import { useActiveNavItem, useNavbar } from '@/stores/index.store';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import UpdatePassword from '../pages/UpdatePassword';

function AppLayout(){
  const isOpen = useNavbar(state => state.isOpen);
  const setIsOpen = useNavbar(state => state.setIsOpen);
  const setActiveTab = useActiveNavItem(state => state.setTab);

  const location = useLocation();

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location, setActiveTab]);

  const { data: user } = useAuth();

  if(!user) return <p>Error de plataforma contacte con soporte...</p>

  if(!user.verified) return <UpdatePassword />

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={ setIsOpen }
        />
      )}

      <AsideLayout />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={ setIsOpen }
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role.name}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                {user.name[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto bg-white p-5 shadow-xs rounded-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;