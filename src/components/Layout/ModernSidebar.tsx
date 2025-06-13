
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { menuItems, settingsMenuItems } from '@/constants/menuItems';

interface ModernSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModernSidebar = ({ isOpen, onClose }: ModernSidebarProps) => {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isSettingsActive = settingsMenuItems.some(item => location.pathname === item.path);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-gray-900/80 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">PT</span>
              </div>
              <span className="font-bold text-lg text-gray-900">SLASH CRM</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                            isActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                          )}
                          onClick={() => onClose()}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 shrink-0",
                              isActive ? "text-blue-700" : "text-gray-400 group-hover:text-blue-700"
                            )}
                          />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                  
                  {/* Settings Menu with Submenu */}
                  <li>
                    <button
                      onClick={() => setSettingsOpen(!settingsOpen)}
                      className={cn(
                        "group flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                        isSettingsActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                      )}
                    >
                      <Settings
                        className={cn(
                          "h-5 w-5 shrink-0",
                          isSettingsActive ? "text-blue-700" : "text-gray-400 group-hover:text-blue-700"
                        )}
                      />
                      <span className="flex-1 text-left">Pengaturan</span>
                      {settingsOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {settingsOpen && (
                      <ul className="mt-1 ml-6 space-y-1">
                        {settingsMenuItems.map((item) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <li key={item.path}>
                              <Link
                                to={item.path}
                                className={cn(
                                  "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors",
                                  isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600 hover:text-blue-700 hover:bg-gray-50"
                                )}
                                onClick={() => onClose()}
                              >
                                <item.icon
                                  className={cn(
                                    "h-4 w-4 shrink-0",
                                    isActive ? "text-blue-700" : "text-gray-400 group-hover:text-blue-700"
                                  )}
                                />
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default ModernSidebar;
