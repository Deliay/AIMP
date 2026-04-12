import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useChatStore } from '../hooks/use-chat';
import { ChatWindow } from '../components/features/chat/chat-window';
import { Button } from '../components/ui/button';

export function ChatDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { topics, fetchTopics, setCurrentTopic } = useChatStore();

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    if (topicId) {
      setCurrentTopic(topicId);
    }
  }, [topicId, setCurrentTopic]);

  if (!topicId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Topic not found</p>
      </div>
    );
  }

  const currentTopic = topics.find((t) => t.id === topicId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-4 border-b border-[#e5e4e7] bg-white">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/chats">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="font-semibold">
            {currentTopic?.name || 'Chat'}
          </h2>
          {currentTopic && (
            <p className="text-sm text-[#6b6375]">
              {currentTopic.members.map((m) => m.email?.split('@')[0]).join(', ')}
            </p>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow topicId={topicId} />
      </div>
    </div>
  );
}
