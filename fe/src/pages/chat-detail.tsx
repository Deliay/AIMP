import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useChatStore } from '../hooks/use-chat';
import { ChatWindow } from '../components/features/chat/chat-window';
import { Button } from '../components/ui/button';
import { useTopicStore } from '../store/topic-store';

export function ChatDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { topics, fetchTopics, setCurrentTopic, messages } = useChatStore();
  const { clearTopicMessages } = useTopicStore();
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    if (topicId) {
      setCurrentTopic(topicId);
    }
  }, [topicId, setCurrentTopic]);

  const handleClearMessages = async () => {
    if (!topicId) return;
    if (!window.confirm('Are you sure you want to clear all messages in this topic?')) {
      return;
    }
    setIsClearing(true);
    try {
      await clearTopicMessages(topicId);
      window.location.reload();
    } catch {
      // Error handled in store
    } finally {
      setIsClearing(false);
    }
  };

  if (!topicId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Topic not found</p>
      </div>
    );
  }

  const currentTopic = topics.find((t) => t.id === topicId);
  const topicMessages = messages[topicId] || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-4 border-b border-[#e5e4e7] bg-white">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/chats">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="font-semibold">
            {currentTopic?.name || 'Chat'}
          </h2>
          {currentTopic && (
            <p className="text-sm text-[#6b6375]">
              {currentTopic.members.map((m) => m.email?.split('@')[0]).join(', ')}
            </p>
          )}
        </div>
        {topicMessages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearMessages}
            disabled={isClearing}
            title="Clear messages"
          >
            <Trash2 className="h-5 w-5 text-red-500" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow topicId={topicId} />
      </div>
    </div>
  );
}