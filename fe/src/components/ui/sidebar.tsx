import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Settings, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="w-80 border-r border-[#e5e4e7] bg-white flex flex-col">
      <div className="p-4 border-b border-[#e5e4e7]">
        <h2 className="text-lg font-semibold mb-3">Menu</h2>
        <div className="flex flex-col gap-1">
          <Link to="/chats">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3',
                isActive('/chats') && 'bg-gray-100'
              )}
            >
              <MessageSquare className="h-5 w-5" />
              Chats
            </Button>
          </Link>
          <Link to="/auth-requests">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3',
                isActive('/auth-requests') && 'bg-gray-100'
              )}
            >
              <Shield className="h-5 w-5" />
              Auth Requests
            </Button>
          </Link>
          <Link to="/settings">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3',
                isActive('/settings') && 'bg-gray-100'
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}