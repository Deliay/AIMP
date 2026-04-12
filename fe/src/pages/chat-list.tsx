import { useEffect } from 'react';
import { useChatStore } from '../hooks/use-chat';
import { ChatList } from '../components/features/chat/chat-list';
import { useParams } from 'react-router-dom';

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
      <div className="w-80 border-r border-[#e5e4e7] bg-white">
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
