'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRefresh } from '@/lib/refresh-context';

interface PullToRefreshProps {
  onRefresh?: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const PULL_THRESHOLD = 52;
const MAX_PULL = 76;

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
      navigator.vibrate(10);
    }
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.016);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.018);
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
  const { triggerRefresh, isRefreshing: globalRefreshing } = useRefresh();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [localRefreshing, setLocalRefreshing] = useState(false);
  const hasTriggeredHapticRef = useRef(false);

  const isRefreshing = localRefreshing || globalRefreshing;

  const touchState = useRef({
    startY: 0,
    startX: 0,
    isPulling: false,
    isLocked: false,
    active: false,
  });

  const doRefresh = useCallback(async () => {
    setLocalRefreshing(true);
    setPullDistance(PULL_THRESHOLD);

    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await triggerRefresh();
      }
    } finally {
      setTimeout(() => {
        setPullDistance(0);
        setLocalRefreshing(false);
      }, 250);
    }
  }, [onRefresh, triggerRefresh]);

  // Touch gesture listener with direction-locking
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (isRefreshing) return;
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
      if (!s.active || isRefreshing) return;

      const t = e.touches[0];
      const dy = t.clientY - s.startY;
      const dx = t.clientX - s.startX;

      // Lock direction after 6px displacement
      if (!s.isLocked) {
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        if (absX >= 6 || absY >= 6) {
          s.isLocked = true;
          // Only activate if vertical pull down at top of page
          s.isPulling = absY > absX * 1.2 && dy > 0 && el.scrollTop <= 0;
        }
      }

      if (s.isPulling && dy > 0 && el.scrollTop <= 0) {
        if (e.cancelable) {
          e.preventDefault();
        }

        const damp = Math.min(MAX_PULL, Math.pow(dy, 0.8) * 1.35);
        setPullDistance(damp);

        if (damp >= PULL_THRESHOLD) {
          if (!hasTriggeredHapticRef.current) {
            playHapticFeedback();
            hasTriggeredHapticRef.current = true;
          }
        } else {
          hasTriggeredHapticRef.current = false;
        }
      }
    };

    const onTouchEnd = () => {
      const s = touchState.current;
      if (!s.active) return;
      s.active = false;

      if (s.isPulling) {
        if (pullDistance >= PULL_THRESHOLD) {
          doRefresh();
        } else {
          setPullDistance(0);
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
  }, [isRefreshing, pullDistance, doRefresh]);

  // Desktop Mouse Drag Testing Support
  const mouseState = useRef({
    active: false,
    startY: 0,
    startX: 0,
    isPulling: false,
    isLocked: false,
  });

  const onMouseDown = (e: React.MouseEvent) => {
    if (isRefreshing || e.button !== 0) return;
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
    if (!s.active || !el || isRefreshing) return;

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
      const damp = Math.min(MAX_PULL, Math.pow(dy, 0.8) * 1.35);
      setPullDistance(damp);

      if (damp >= PULL_THRESHOLD) {
        if (!hasTriggeredHapticRef.current) {
          playHapticFeedback();
          hasTriggeredHapticRef.current = true;
        }
      } else {
        hasTriggeredHapticRef.current = false;
      }
    }
  };

  const onMouseUp = () => {
    const s = mouseState.current;
    if (!s.active) return;
    s.active = false;

    if (s.isPulling) {
      if (pullDistance >= PULL_THRESHOLD) {
        doRefresh();
      } else {
        setPullDistance(0);
      }
    }
    s.isPulling = false;
    s.isLocked = false;
  };

  const progressRatio = Math.min(1, pullDistance / PULL_THRESHOLD);
  const isPullingDown = pullDistance > 4;
  const showIndicator = isPullingDown || isRefreshing;

  // SVG Circle Parameters (Diameter 28px)
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = isRefreshing ? 0 : circumference * (1 - progressRatio * 0.85);

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
      {/* ─── Minimalist Pure Circular Ring Loader (NO TEXT) ─── */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: `translateX(-50%) translateY(${
            showIndicator ? Math.min(pullDistance, PULL_THRESHOLD) * 0.82 : -45
          }px) scale(${showIndicator ? Math.max(0.8, 0.75 + progressRatio * 0.25) : 0.6})`,
          opacity: showIndicator ? Math.min(1, 0.2 + progressRatio * 0.8) : 0,
          zIndex: 40,
          pointerEvents: 'none',
          transition: !isPullingDown || isRefreshing ? 'all 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(37, 99, 235, 0.18)',
            boxShadow: '0 3px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(37, 99, 235, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            style={{
              transform: isRefreshing
                ? 'none'
                : `rotate(${progressRatio * 280}deg)`,
              animation: isRefreshing ? 'ptr-spin 0.7s linear infinite' : 'none',
              transformOrigin: 'center',
            }}
          >
            {/* Background track */}
            <circle
              cx="12"
              cy="12"
              r={radius}
              fill="none"
              stroke="rgba(37, 99, 235, 0.15)"
              strokeWidth="2.5"
            />
            {/* Dynamic Active Progress / Spinning Ring */}
            <circle
              cx="12"
              cy="12"
              r={radius}
              fill="none"
              stroke="var(--color-accent, #2563EB)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={isRefreshing ? `${circumference * 0.75} ${circumference * 0.25}` : circumference}
              strokeDashoffset={strokeOffset}
            />
          </svg>
        </div>
      </div>

      {/* ─── Main Content container slightly translating down during pull ─── */}
      <div
        style={{
          transform: `translateY(${
            showIndicator
              ? isRefreshing
                ? 38
                : pullDistance * 0.4
              : 0
          }px)`,
          transition: !isPullingDown || isRefreshing ? 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
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
