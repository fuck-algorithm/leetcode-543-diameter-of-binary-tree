import { useEffect, useCallback } from 'react';
import './ControlPanel.css';

interface ControlPanelProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onSeek: (step: number) => void;
  onReset: () => void;
}

export function ControlPanel({
  currentStep,
  totalSteps,
  isPlaying,
  onPrevious,
  onNext,
  onPlayPause,
  onSeek,
  onReset,
}: ControlPanelProps) {
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  // 键盘快捷键
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        onPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onNext();
        break;
      case ' ':
        e.preventDefault();
        onPlayPause();
        break;
    }
  }, [onPrevious, onNext, onPlayPause]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const step = Math.round(percentage * (totalSteps - 1));
    onSeek(Math.max(0, Math.min(step, totalSteps - 1)));
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleProgressClick(e);
  };

  return (
    <div className="control-panel">
      <div className="controls-row">
        <button 
          className="control-btn" 
          onClick={onReset}
          title="重置"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M12,5V1L7,6L12,11V7A6,6 0 0,1 18,13A6,6 0 0,1 12,19A6,6 0 0,1 6,13H4A8,8 0 0,0 12,21A8,8 0 0,0 20,13A8,8 0 0,0 12,5Z" />
          </svg>
        </button>
        
        <button 
          className="control-btn" 
          onClick={onPrevious}
          disabled={currentStep === 0}
          title="上一步 (←)"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z" />
          </svg>
          <span className="btn-hint">←</span>
        </button>

        <button 
          className="control-btn play-btn" 
          onClick={onPlayPause}
          title={isPlaying ? '暂停 (空格)' : '播放 (空格)'}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
            </svg>
          )}
          <span className="btn-hint">空格</span>
        </button>

        <button 
          className="control-btn" 
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1}
          title="下一步 (→)"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z" />
          </svg>
          <span className="btn-hint">→</span>
        </button>

        <div className="step-counter">
          {currentStep + 1} / {totalSteps}
        </div>
      </div>

      <div 
        className="progress-bar"
        onClick={handleProgressClick}
        onMouseMove={handleProgressDrag}
      >
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
        <div 
          className="progress-thumb"
          style={{ left: `${progress}%` }}
        />
      </div>
    </div>
  );
}
