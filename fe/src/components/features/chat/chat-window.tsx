import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../../../store/chat-store';
import { useAuthStore } from '../../../store/auth-store';
import { MessageBubble } from './message-bubble';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Send } from 'lucide-react';

interface ChatWindowProps {
  topicId: string;
}

export function ChatWindow({ topicId }: ChatWindowProps) {
  const { topicId: _topicId } = useParams<{ topicId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = React.useState('');

  const { messages, fetchMessages, sendMessage, markAsRead, isLoading } = useChatStore();
  const { user } = useAuthStore();
  const currentMessages = messages[topicId] || [];

  useEffect(() => {
    if (topicId) {
      fetchMessages(topicId);
      markAsRead(topicId);
    }
  }, [topicId, fetchMessages, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !_topicId) return;
    try {
      await sendMessage(_topicId, 'TEXT', { content: inputValue });
      setInputValue('');
    } catch {
      // Error handled in store
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && currentMessages.length === 0 ? (
          <p className="text-center text-[#6b6375]">Loading messages...</p>
        ) : currentMessages.length === 0 ? (
          <p className="text-center text-[#6b6375]">No messages yet. Start the conversation!</p>
        ) : (
          currentMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender.id === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-[#e5e4e7] p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
