import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { cn } from '../../../lib/utils';
import { Badge } from '../../ui/badge';
import type { Message, FormContent, TextContent } from '../../../types/api';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onFormSubmit?: (data: Record<string, string>) => void;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const senderName = message.sender.email?.split('@')[0] || 'Unknown';

  const renderContent = () => {
    if (message.type === 'FORM') {
      const formContent = message.content as FormContent;
      return (
        <div className="rounded-lg border border-[#e5e4e7] bg-white p-4 mt-2">
          <h4 className="font-medium mb-2">{formContent.title}</h4>
          <p className="text-sm text-[#6b6375] mb-3">
            Fields: {formContent.fields.map((f) => f.label).join(', ')}
          </p>
          <Badge variant="secondary">{formContent.submitLabel || 'Submit'}</Badge>
        </div>
      );
    }

    const textContent = message.content as TextContent;
    const cleanContent = DOMPurify.sanitize(textContent.content);

    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanContent}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        isOwn ? 'items-end' : 'items-start'
      )}
    >
      <div className="flex items-center gap-2">
        {!isOwn && (
          <span className="text-xs text-[#6b6375]">{senderName}</span>
        )}
        <Badge variant={message.sender.type === 'AGENT' ? 'secondary' : 'outline'}>
          {message.sender.type === 'AGENT' ? 'Agent' : 'Human'}
        </Badge>
      </div>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2',
          isOwn
            ? 'bg-[#aa3bff] text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        )}
      >
        {renderContent()}
      </div>
      <span className="text-xs text-[#6b6375]">
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}
