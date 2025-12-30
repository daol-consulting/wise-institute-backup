'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MediaItem } from '@/lib/contentful';

type ImageEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mediaItemId: string) => Promise<void>;
  currentImageSrc?: string;
  mediaItems: MediaItem[];
  title?: string;
};

export default function ImageEditModal({
  isOpen,
  onClose,
  onSave,
  currentImageSrc,
  mediaItems,
  title = 'Edit Image',
}: ImageEditModalProps) {
  const [selectedMediaId, setSelectedMediaId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedMediaId('');
      setMessage(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMediaId) {
      setMessage('Please select a media item');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await onSave(selectedMediaId);
      setMessage('Image updated successfully!');
      // 상태 업데이트가 완료될 시간을 주기 위해 약간 더 기다림
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 2000);
    } catch (err: any) {
      setMessage(err.message || 'Failed to update image');
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-secondary-200 shadow-2xl max-w-lg w-full">
        <div className="sticky top-0 bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-secondary-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-secondary-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-xl ${
              message.includes('successfully')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {currentImageSrc && (
            <div>
              <p className="text-sm text-secondary-700 mb-2 font-medium">Current Image:</p>
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-secondary-200">
                <img src={currentImageSrc} alt="Current" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Select Media Item *
            </label>
            <select
              value={selectedMediaId}
              onChange={(e) => setSelectedMediaId(e.target.value)}
              required
              className="w-full border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Choose a media item...</option>
              {mediaItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          {selectedMediaId && (
            <div>
              <p className="text-sm text-secondary-700 mb-2 font-medium">Preview:</p>
              {(() => {
                const selectedItem = mediaItems.find(m => m.id === selectedMediaId);
                const previewImage = selectedItem?.thumbnail?.[0] || selectedItem?.images?.[0];
                return previewImage ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-secondary-200">
                    <img
                      src={previewImage}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null;
              })()}
            </div>
          )}

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
              disabled={submitting || !selectedMediaId}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating...' : 'Update Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
