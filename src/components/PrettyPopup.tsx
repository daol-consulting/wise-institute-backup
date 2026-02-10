'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

type PrettyPopupProps = {
  /** 팝업 열림 여부 */
  isOpen: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 상단에 들어갈 작은 라벨 (선택사항) */
  eyebrow?: string;
  /** 메인 타이틀 */
  title: string;
  /** 본문 내용 */
  description?: ReactNode;
  /** 주요 액션 버튼 텍스트 */
  primaryLabel?: string;
  /** 주요 액션 콜백 */
  onPrimaryClick?: () => void;
  /** 서브 액션 버튼 텍스트 */
  secondaryLabel?: string;
  /** 서브 액션 콜백 (기본값: 닫기) */
  onSecondaryClick?: () => void;
  /** 하단에 들어갈 추가 내용 (예: 작은 텍스트, 링크 등) */
  footer?: ReactNode;
};

export function PrettyPopup({
  isOpen,
  onClose,
  eyebrow,
  title,
  description,
  primaryLabel = '확인',
  onPrimaryClick,
  secondaryLabel,
  onSecondaryClick,
  footer,
}: PrettyPopupProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSecondaryClick = () => {
    if (onSecondaryClick) {
      onSecondaryClick();
    } else {
      onClose();
    }
  };

  const handlePrimaryClick = () => {
    if (onPrimaryClick) {
      onPrimaryClick();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
      {/* 배경 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 팝업 카드 */}
      <div className="relative z-10 w-full max-w-md origin-center animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-[0_24px_60px_rgba(15,23,42,0.45)] rounded-3xl overflow-hidden">
          {/* 상단 장식 그라데이션 */}
          <div className="h-1 w-full bg-gradient-to-r from-primary-500 via-emerald-400 to-primary-600" />

          {/* 헤더 */}
          <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-4">
            <div>
              {eyebrow && (
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary-500 mb-1">
                  {eyebrow}
                </p>
              )}
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-snug">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 inline-flex items-center justify-center rounded-full p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 본문 */}
          {description && (
            <div className="px-6 pb-4 text-sm text-slate-600 leading-relaxed">
              {description}
            </div>
          )}

          {/* 푸터 / 버튼 영역 */}
          <div className="px-6 pb-5 pt-3 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {secondaryLabel && (
                <button
                  type="button"
                  onClick={handleSecondaryClick}
                  className="w-full sm:w-auto flex-1 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                >
                  {secondaryLabel}
                </button>
              )}
              <button
                type="button"
                onClick={handlePrimaryClick}
                className="w-full sm:w-auto flex-1 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-sm font-semibold text-white px-4 py-2.5 shadow-md shadow-primary-600/30 hover:brightness-110 active:translate-y-[1px] transition-all"
              >
                {primaryLabel}
              </button>
            </div>

            {footer && (
              <div className="text-xs text-slate-500 leading-relaxed">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

