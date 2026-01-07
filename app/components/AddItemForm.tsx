'use client';

import { useState } from 'react';
import { imageToBase64 } from '../utils/storage';
import { CATEGORIES, CategoryId } from '../types';

interface AddItemFormProps {
  onSubmit: (name: string, image?: string, category?: string) => void;
}

export default function AddItemForm({ onSubmit }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [category, setCategory] = useState<CategoryId>('food');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    try {
      const base64 = await imageToBase64(file);
      setImage(base64);
      setPreviewUrl(base64);
    } catch (error) {
      console.error('Error processing image:', error);
    }
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), image, category);
      setName('');
      setImage(undefined);
      setPreviewUrl(undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 h-full flex flex-col">
      {/* Category Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                ${category === cat.id
                  ? 'bg-[var(--accent-primary)] text-white shadow-md'
                  : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]'
                }
              `}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What did you try?"
          className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus)]/30 focus:border-[var(--input-focus)] transition-all duration-200"
          required
        />
      </div>

      {/* Photo Upload */}
      <div className="space-y-2 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          Photo <span className="font-normal opacity-60">(optional)</span>
        </span>
        
        <div className="relative group">
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onDragEnter={() => setIsDragOver(true)}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={() => setIsDragOver(false)}
          />
          
          {previewUrl ? (
            <div className="relative aspect-video rounded-xl overflow-hidden border border-[var(--border)] shadow-sm">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">Click to change</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImage(undefined);
                  setPreviewUrl(undefined);
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors z-20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className={`
              flex items-center gap-4 p-4 rounded-xl border-2 border-dashed transition-all duration-200
              ${isDragOver 
                ? 'border-[var(--accent-secondary)] bg-[var(--accent-secondary)]/5' 
                : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--foreground-muted)]/30'
              }
            `}>
              <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-[var(--card-bg)] flex items-center justify-center shadow-sm border border-[var(--border)]">
                <svg className="w-5 h-5 text-[var(--accent-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Drop a photo or click to browse
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  JPG, PNG up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!name.trim() || isLoading}
        className="w-full py-3.5 bg-gradient-to-r from-[#b31d42] to-[#e74b6f] hover:from-[#8a1632] hover:to-[#b31d42] text-white font-semibold rounded-xl shadow-lg shadow-[#b31d42]/20 hover:shadow-[#b31d42]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform active:scale-[0.99] flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Start Ranking</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
