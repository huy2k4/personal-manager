'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowDown, RefreshCw, Check } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh?: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const PULL_THRESHOLD = 56;
const MAX_PULL = 82;

let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playHapticFeedback() {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(12);
    }
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.018);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  } catch {
    // Graceful fallback
  }
}

export default function PullToRefresh({
  onRefresh,
  children,
  className = '',
  id,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshState, setRefreshState] = useState<'idle' | 'pulling' | 'ready' | 'refreshing' | 'success'>('idle');
  const hasTriggeredHapticRef = useRef(false);

  const touchState = useRef({
    startY: 0,
    startX: 0,
    isPulling: false,
    isLocked: false,
    active: false,
  });

  const doRefresh = useCallback(async () => {
    setRefreshState('refreshing');
    setPullDistance(PULL_THRESHOLD);

    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Default action: 800ms loading UI then page reload
        await new Promise((res) => setTimeout(res, 850));
        window.location.reload();
        return;
      }
      setRefreshState('success');
      setTimeout(() => {
        setPullDistance(0);
        setTimeout(() => setRefreshState('idle'), 300);
      }, 400);
    } catch {
      setPullDistance(0);
      setRefreshState('idle');
    }
  }, [onRefresh]);

  // Touch gesture listener with passive: false for seamless pull-down
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (refreshState === 'refreshing' || refreshState === 'success') return;
      getAudioContext();
      const t = e.touches[0];
      touchState.current = {
        startY: t.clientY,
        startX: t.clientX,
        isPulling: false,
        isLocked: false,
        active: true,
      };
      hasTriggeredHapticRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      const s = touchState.current;
      if (!s.active || refreshState === 'refreshing' || refreshState === 'success') return;

      const t = e.touches[0];
      const dy = t.clientY - s.startY;
      const dx = t.clientX - s.startX;

      // Lock direction after 6px
      if (!s.isLocked) {
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        if (absX >= 6 || absY >= 6) {
          s.isLocked = true;
          // Only pull if vertical intent and pulling downward at the very top (scrollTop <= 0)
          s.isPulling = absY > absX * 1.15 && dy > 0 && el.scrollTop <= 0;
        }
      }

      if (s.isPulling && dy > 0 && el.scrollTop <= 0) {
        if (e.cancelable) {
          e.preventDefault();
        }

        // Resistance curve
        const damp = Math.min(MAX_PULL, Math.pow(dy, 0.82) * 1.45);
        setPullDistance(damp);

        if (damp >= PULL_THRESHOLD) {
          if (!hasTriggeredHapticRef.current) {
            playHapticFeedback();
            hasTriggeredHapticRef.current = true;
          }
          setRefreshState('ready');
        } else {
          hasTriggeredHapticRef.current = false;
          setRefreshState('pulling');
        }
      }
    };

    const onTouchEnd = () => {
      const s = touchState.current;
      if (!s.active) return;
      s.active = false;

      if (s.isPulling) {
        if (refreshState === 'ready') {
          doRefresh();
        } else {
          setPullDistance(0);
          setRefreshState('idle');
        }
      }
      s.isPulling = false;
      s.isLocked = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [refreshState, doRefresh]);

  // Desktop Mouse Drag testing support
  const mouseState = useRef({
    active: false,
    startY: 0,
    startX: 0,
    isPulling: false,
    isLocked: false,
  });

  const onMouseDown = (e: React.MouseEvent) => {
    if (refreshState === 'refreshing' || refreshState === 'success' || e.button !== 0) return;
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;

    getAudioContext();
    mouseState.current = {
      active: true,
      startY: e.clientY,
      startX: e.clientX,
      isPulling: false,
      isLocked: false,
    };
    hasTriggeredHapticRef.current = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const s = mouseState.current;
    const el = containerRef.current;
    if (!s.active || !el || refreshState === 'refreshing' || refreshState === 'success') return;

    const dy = e.clientY - s.startY;
    const dx = e.clientX - s.startX;

    if (!s.isLocked) {
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (absX >= 5 || absY >= 5) {
        s.isLocked = true;
        s.isPulling = absY > absX && dy > 0 && el.scrollTop <= 0;
      }
    }

    if (s.isPulling && dy > 0 && el.scrollTop <= 0) {
      const damp = Math.min(MAX_PULL, Math.pow(dy, 0.82) * 1.45);
      setPullDistance(damp);

      if (damp >= PULL_THRESHOLD) {
        if (!hasTriggeredHapticRef.current) {
          playHapticFeedback();
          hasTriggeredHapticRef.current = true;
        }
        setRefreshState('ready');
      } else {
        hasTriggeredHapticRef.current = false;
        setRefreshState('pulling');
      }
    }
  };

  const onMouseUp = () => {
    const s = mouseState.current;
    if (!s.active) return;
    s.active = false;

    if (s.isPulling) {
      if (refreshState === 'ready') {
        doRefresh();
      } else {
        setPullDistance(0);
        setRefreshState('idle');
      }
    }
    s.isPulling = false;
    s.isLocked = false;
  };

  const progressRatio = Math.min(1, pullDistance / PULL_THRESHOLD);
  const isActivelyEngaged = refreshState !== 'idle';

  return (
    <div
      ref={containerRef}
      id={id}
      className={`page-scroll ${className}`}
      style={{
        position: 'relative',
        overscrollBehavior: 'contain',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* ─── Premium Pull-To-Refresh Floating Pill ─── */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: `translateX(-50%) translateY(${isActivelyEngaged ? Math.min(pullDistance, PULL_THRESHOLD) * 0.85 : -50}px) scale(${
            isActivelyEngaged ? 0.95 + progressRatio * 0.05 : 0.85
          })`,
          opacity: isActivelyEngaged ? Math.max(0.2, progressRatio) : 0,
          zIndex: 40,
          pointerEvents: 'none',
          transition: refreshState === 'pulling' ? 'none' : 'all 0.32s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderRadius: 99,
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${
              refreshState === 'ready' || refreshState === 'refreshing'
                ? 'rgba(37, 99, 235, 0.35)'
                : 'rgba(0, 0, 0, 0.08)'
            }`,
            boxShadow:
              refreshState === 'ready' || refreshState === 'refreshing'
                ? '0 6px 20px rgba(37, 99, 235, 0.16), 0 2px 6px rgba(0,0,0,0.06)'
                : '0 4px 14px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Icon state */}
          <div
            style={{
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {refreshState === 'refreshing' ? (
              <RefreshCw
                size={14}
                color="var(--color-accent, #2563EB)"
                style={{
                  animation: 'ptr-spin 0.75s linear infinite',
                }}
              />
            ) : refreshState === 'success' ? (
              <Check size={14} color="#16A34A" />
            ) : (
              <div
                style={{
                  transform: `rotate(${refreshState === 'ready' ? 180 : progressRatio * 180}deg)`,
                  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowDown
                  size={14}
                  color={refreshState === 'ready' ? 'var(--color-accent, #2563EB)' : 'var(--color-text-2, #6B6B6B)'}
                />
              </div>
            )}
          </div>

          {/* Text message */}
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.01em',
              color:
                refreshState === 'ready' || refreshState === 'refreshing'
                  ? 'var(--color-accent, #2563EB)'
                  : refreshState === 'success'
                  ? '#16A34A'
                  : 'var(--color-text-2, #6B6B6B)',
              whiteSpace: 'nowrap',
            }}
          >
            {refreshState === 'pulling' && 'Kéo để làm mới'}
            {refreshState === 'ready' && 'Thả để tải lại'}
            {refreshState === 'refreshing' && 'Đang làm mới...'}
            {refreshState === 'success' && 'Đã làm mới!'}
          </span>
        </div>
      </div>

      {/* ─── Main Content translated down smoothly during pull ─── */}
      <div
        style={{
          transform: `translateY(${
            isActivelyEngaged
              ? refreshState === 'refreshing' || refreshState === 'success'
                ? 44
                : pullDistance * 0.42
              : 0
          }px)`,
          transition: refreshState === 'pulling' ? 'none' : 'transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {children}
      </div>

      <style jsx global>{`
        @keyframes ptr-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
