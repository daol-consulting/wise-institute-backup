'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { NewsItem } from '@/lib/news';
import imageCompression from 'browser-image-compression';

type NewsEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  newsItem?: NewsItem | null;
  mediaItems: Array<{ id: string; title: string; thumbnail?: string[] }>;
};

export default function NewsEditModal({ isOpen, onClose, onSave, newsItem, mediaItems }: NewsEditModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Institute News');
  const [categoryColor, setCategoryColor] = useState<'blue' | 'teal' | 'gray'>('blue');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [href, setHref] = useState('/news');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (newsItem) {
      setTitle(newsItem.title || '');
      setCategory(newsItem.category || 'Institute News');
      setCategoryColor(newsItem.categoryColor || 'blue');
      setDescription(newsItem.description || '');
      setDate(newsItem.date || '');
      setHref(newsItem.href || '/news');
      setExistingImage(newsItem.image || null);
      setClearImage(false);
    } else {
      setTitle('');
      setCategory('Institute News');
      setCategoryColor('blue');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setHref('/news');
      setExistingImage(null);
      setClearImage(false);
    }
    setImagePreview(null);
  }, [newsItem, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setClearImage(false);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData();
      formData.set('title', title);
      formData.set('category', category);
      formData.set('categoryColor', categoryColor);
      formData.set('description', description);
      formData.set('date', date);
      formData.set('href', href);

      const imageFile = (form.elements.namedItem('image') as HTMLInputElement)?.files?.[0];
      if (imageFile) {
        const compressedFile = await imageCompression(imageFile, {
          maxSizeMB: 2,
          maxWidthOrHeight: 2000,
          useWebWorker: true,
          fileType: 'image/jpeg'
        });
        formData.append('image', compressedFile, compressedFile.name);
      }

      if (clearImage && newsItem) {
        formData.set('clearImage', 'true');
      }

      const endpoint = newsItem ? `/api/admin/news/${newsItem.id}` : '/api/admin/news';
      const method = newsItem ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to save news');
      }

      setMessage(newsItem ? 'News updated successfully!' : 'News created successfully!');
      setTimeout(() => {
        onSave();
        onClose();
        setMessage(null);
        // 뉴스 생성 후 페이지 새로고침 (Contentful 캐시 문제 해결)
        if (!newsItem) {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }, 1500);
    } catch (err: any) {
      setMessage(err.message || 'Failed to save news');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-secondary-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-secondary-900">
            {newsItem ? 'Edit News' : 'Create News'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-secondary-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6" encType="multipart/form-data">
          {message && (
            <div className={`p-4 rounded-xl ${
              message.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Category *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Category Color *</label>
              <select
                value={categoryColor}
                onChange={(e) => setCategoryColor(e.target.value as 'blue' | 'teal' | 'gray')}
                required
                className="w-full border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="blue">Blue</option>
                <option value="teal">Teal</option>
                <option value="gray">Gray</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Link (optional)</label>
            <input
              type="text"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              className="w-full border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Image (optional)</label>
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-600 file:text-white hover:file:bg-primary-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
            
            {existingImage && (
              <div className="mt-4">
                <p className="text-sm text-secondary-700 mb-2 font-medium">Existing Image:</p>
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-secondary-200">
                  <Image src={existingImage} alt="Existing" fill className="object-cover" />
                </div>
                <label className="inline-flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clearImage}
                    onChange={(e) => setClearImage(e.target.checked)}
                    className="rounded border-secondary-200"
                  />
                  <span className="text-sm text-secondary-600">Remove image</span>
                </label>
              </div>
            )}
            
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-secondary-700 mb-2 font-medium">New Image Preview:</p>
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-secondary-200">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-secondary-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-secondary-200 text-secondary-700 rounded-xl hover:bg-secondary-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : newsItem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

