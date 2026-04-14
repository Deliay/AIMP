import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent } from '../../ui/card';
import { useTopicStore } from '../../../store/topic-store';

interface TopicSearchProps {
  onSelectResult?: (slug: string) => void;
}

export function TopicSearch({ onSelectResult }: TopicSearchProps) {
  const [keyword, setKeyword] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const { searchResults, isSearching, searchError, searchTopics, clearSearchResults } =
    useTopicStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      await searchTopics(keyword);
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setKeyword('');
    clearSearchResults();
  };

  const handleSelectResult = (slug: string) => {
    if (onSelectResult) {
      onSelectResult(slug);
    }
    handleClose();
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search topics..."
          className="flex-1"
        />
        <Button type="submit" variant="outline" disabled={isSearching}>
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={handleClose}
            aria-label="Close search results"
          />
          <div className="absolute z-50 w-full mt-2">
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-3 border-b border-[#e5e4e7]">
                  <p className="text-sm font-medium">Search Results</p>
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {isSearching ? (
                  <div className="p-4 text-center text-[#6b6375]">Searching...</div>
                ) : searchError ? (
                  <div className="p-4 text-center text-red-500">{searchError}</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-[#6b6375]">No results found</div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.slug}
                        type="button"
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-[#e5e4e7] last:border-b-0"
                        onClick={() => handleSelectResult(result.slug)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{result.name}</p>
                            <p className="text-sm text-[#6b6375]">{result.description}</p>
                          </div>
                          <span className="text-xs text-[#6b6375]">
                            {(result.relateScore * 100).toFixed(0)}% match
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}