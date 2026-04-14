import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useChatStore } from '../hooks/use-chat';
import { ChatList } from '../components/features/chat/chat-list';
import { Sidebar } from '../components/ui/sidebar';
import { Button } from '../components/ui/button';
import { TopicCreateModal } from '../components/features/topic/topic-create-modal';
import { TopicSearch } from '../components/features/topic/topic-search';

export function ChatListPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { topics, fetchTopics, currentTopicId, setCurrentTopic } = useChatStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chats</h2>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Topic
            </Button>
          </div>
          <TopicSearch />
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
      <TopicCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}