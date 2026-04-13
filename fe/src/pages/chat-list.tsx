import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../hooks/use-chat';
import { ChatList } from '../components/features/chat/chat-list';
import { Sidebar } from '../components/ui/sidebar';

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
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-[#e5e4e7] bg-white">
          <h2 className="text-lg font-semibold">Chats</h2>
        </div>
        {topics.length > 0 ? (
          <ChatList topics={topics} currentTopicId={currentTopicId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-[#6b6375]">No conversations yet</p>
            <p className="text-sm text-[#9b95a0] mt-1">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
