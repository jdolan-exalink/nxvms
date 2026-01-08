import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';

export interface TagsManagerProps {
  tags: string[];
  selectedTags?: string[];
  maxTags?: number;
  onTagsChange?: (tags: string[]) => void;
  onSelectedTagsChange?: (tags: string[]) => void;
  allowCreate?: boolean;
  placeholder?: string;
}

export const TagsManager: React.FC<TagsManagerProps> = ({
  tags,
  selectedTags = [],
  maxTags = 10,
  onTagsChange,
  onSelectedTagsChange,
  allowCreate = true,
  placeholder = 'Add or select tags...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    if (value.trim()) {
      const filtered = tags.filter(
        (tag) =>
          tag.toLowerCase().includes(value.toLowerCase()) &&
          !selectedTags.includes(tag)
      );
      setFilteredTags(filtered);
      setShowDropdown(true);
    } else {
      setFilteredTags([]);
      setShowDropdown(false);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    
    if (!trimmedTag) return;
    if (selectedTags.includes(trimmedTag)) return;
    if (selectedTags.length >= maxTags) return;

    const newSelected = [...selectedTags, trimmedTag];
    onSelectedTagsChange?.(newSelected);

    // Add to tag list if new and creation allowed
    if (allowCreate && !tags.includes(trimmedTag)) {
      onTagsChange?.([...tags, trimmedTag]);
    }

    setInputValue('');
    setShowDropdown(false);
  };

  const removeTag = (tag: string) => {
    const newSelected = selectedTags.filter((t) => t !== tag);
    onSelectedTagsChange?.(newSelected);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const canAddMore = selectedTags.length < maxTags;

  return (
    <div className="w-full space-y-3">
      {/* Input and dropdown */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-dark-900 border border-dark-700 rounded-lg p-3 focus-within:border-primary-500">
          <Search className="w-4 h-4 text-dark-500" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => inputValue && setShowDropdown(true)}
            placeholder={placeholder}
            disabled={!canAddMore}
            className="flex-1 bg-transparent text-white placeholder-dark-500 focus:outline-none disabled:opacity-50"
          />
          {inputValue && canAddMore && (
            <button
              onClick={() => addTag(inputValue)}
              className="p-1 hover:bg-dark-800 rounded transition-colors text-primary-400"
              title="Add tag"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && filteredTags.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
            {filteredTags.map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="w-full text-left px-4 py-2 hover:bg-dark-700 transition-colors text-white text-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Create new tag suggestion */}
        {allowCreate &&
          inputValue.trim() &&
          !tags.includes(inputValue.trim().toLowerCase()) &&
          showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-50">
              <button
                onClick={() => addTag(inputValue)}
                className="w-full text-left px-4 py-2 hover:bg-dark-700 transition-colors text-primary-400 text-sm font-medium"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Create "{inputValue.trim()}"
              </button>
            </div>
          )}
      </div>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <div
                key={tag}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/20 border border-primary-500/50 rounded-full"
              >
                <span className="text-sm text-primary-300">{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="p-0.5 hover:bg-primary-500/30 rounded transition-colors text-primary-300 hover:text-primary-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-dark-400 mt-2">
            {selectedTags.length} / {maxTags} tags selected
          </p>
        </div>
      )}
    </div>
  );
};
