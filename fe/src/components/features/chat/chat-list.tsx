import { Link } from 'react-router-dom';
import { MessageSquare, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Badge } from '../../ui/badge';
import type { Topic } from '../../../types/api';

interface ChatListProps {
  topics: Topic[];
  currentTopicId: string | null;
}

export function ChatList({ topics, currentTopicId }: ChatListProps) {
  return (
    <div className="flex flex-col gap-1 p-2">
      {topics.map((topic) => (
        <Link
          key={topic.id}
          to={`/chats/${topic.id}`}
          className={cn(
            'flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-100',
            currentTopicId === topic.id && 'bg-gray-100'
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#aa3bff]/10">
            {topic.type === 'GROUP' ? (
              <Users className="h-5 w-5 text-[#aa3bff]" />
            ) : (
              <MessageSquare className="h-5 w-5 text-[#aa3bff]" />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-medium truncate">
                {topic.name || topic.members.map((m) => m.email?.split('@')[0]).join(', ')}
              </span>
              {topic.unreadCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {topic.unreadCount}
                </Badge>
              )}
            </div>
            {topic.lastMessage && (
              <p className="text-sm text-[#6b6375] truncate">
                {topic.lastMessage.sender.email?.split('@')[0]}:{' '}
                {topic.lastMessage.type === 'TEXT'
                  ? (topic.lastMessage.content as { content: string }).content
                  : '[Form]'}
              </p>
            )}
          </div>
        </Link>
      ))}
      {topics.length === 0 && (
        <p className="p-4 text-center text-sm text-[#6b6375]">No conversations yet</p>
      )}
    </div>
  );
}
