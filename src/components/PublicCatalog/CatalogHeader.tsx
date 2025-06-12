
import React from 'react';
import { Search, User, LogOut, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CatalogHeaderProps {
  session: any;
  onHistoryClick: () => void;
  onLogout: () => void;
  onLogin: () => void;
}

const CatalogHeader = ({ session, onHistoryClick, onLogout, onLogin }: CatalogHeaderProps) => {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="w-full max-w-sm mx-auto px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">Katalog Produk</h1>
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          {/* User Menu */}
          <div className="flex items-center gap-2">
            {session ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onHistoryClick}
                  className="flex items-center gap-1"
                >
                  <History className="h-3 w-3" />
                  <span className="hidden sm:inline">History</span>
                </Button>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{session.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onLogout}
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-3 w-3" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={onLogin}
                className="bg-green-600 hover:bg-green-700"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogHeader;
