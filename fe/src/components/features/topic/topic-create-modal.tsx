import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { useTopicStore } from '../../../store/topic-store';
import { useChatStore } from '../../../hooks/use-chat';

interface TopicCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TopicCreateModal({ isOpen, onClose }: TopicCreateModalProps) {
  const [slug, setSlug] = React.useState('');
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { createTopic, createError } = useTopicStore();
  const { fetchTopics } = useChatStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createTopic(slug, name, description, false);
      await fetchTopics();
      setSlug('');
      setName('');
      setDescription('');
      onClose();
    } catch {
      // Error handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSlug('');
    setName('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <button
        type="button"
        className="fixed inset-0 bg-black/50 cursor-default"
        onClick={handleClose}
        aria-label="Close modal"
      />
      <div className="relative z-10 w-full max-w-md">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Create Topic</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="unique-topic-slug"
                  required
                />
                <p className="text-xs text-[#6b6375]">
                  Unique identifier for API references
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Topic"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Topic description"
                  required
                />
              </div>
              {createError && (
                <p className="text-sm text-red-500">{createError}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}