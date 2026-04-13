import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageSquare, Settings, Shield } from 'lucide-react';
import { useChatStore } from '../hooks/use-chat';
import { ChatList } from '../components/features/chat/chat-list';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

export function ChatListPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { topics, fetchTopics, currentTopicId, setCurrentTopic } = useChatStore();

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    if (topicId) {
      setCurrentTopic(topicId);
    }
  }, [topicId, setCurrentTopic]);

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-[#e5e4e7] bg-white flex flex-col">
        <div className="p-4 border-b border-[#e5e4e7]">
          <h2 className="text-lg font-semibold mb-3">Menu</h2>
          <div className="flex flex-col gap-1">
            <Link to="/chats">
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3',
                  !topicId && 'bg-gray-100'
                )}
              >
                <MessageSquare className="h-5 w-5" />
                Chats
              </Button>
            </Link>
            <Link to="/auth-requests">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Shield className="h-5 w-5" />
                Auth Requests
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Settings className="h-5 w-5" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
        <div className="p-4 border-b border-[#e5e4e7]">
          <h2 className="text-lg font-semibold">Chats</h2>
        </div>
        <ChatList
          topics={topics}
          currentTopicId={currentTopicId}
        />
      </div>
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-[#6b6375]">Select a conversation to start chatting</p>
      </div>
    </div>
  );
}
