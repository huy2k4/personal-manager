'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface TickerConfig {
  id: 'BTC' | 'ETH' | 'XAU';
  symbol: string;
  streamName: string;
  name: string;
  logo: string;
  url: string;
  color: string;
}

const TICKERS: TickerConfig[] = [
  {
    id: 'BTC',
    symbol: 'BTCUSDT',
    streamName: 'btcusdt@ticker',
    name: 'Bitcoin Futures',
    logo: '/BTC.png',
    url: 'https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&interval=1h&limit=168',
    color: '#F7931A',
  },
  {
    id: 'ETH',
    symbol: 'ETHUSDT',
    streamName: 'ethusdt@ticker',
    name: 'Ethereum Futures',
    logo: '/ETH.png',
    url: 'https://fapi.binance.com/fapi/v1/klines?symbol=ETHUSDT&interval=1h&limit=168',
    color: '#627EEA',
  },
  {
    id: 'XAU',
    symbol: 'XAUUSDT',
    streamName: 'xauusdt@ticker',
    name: 'Gold Futures (XAU)',
    logo: '/XAU.png',
    url: 'https://fapi.binance.com/fapi/v1/klines?symbol=XAUUSDT&interval=1h&limit=168',
    color: '#EAB308',
  },
];

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface TickerData {
  candles: Candle[];
  current: number;
  prevPrice?: number;
  price1d: number;
  change1d: number;
  price7d: number;
  change7d: number;
  high7d: number;
  low7d: number;
  lastTickTime: number;
}

import { useRefresh } from '@/lib/refresh-context';

function formatVNNumber(n: number | undefined | null): string {
  if (n === undefined || n === null || isNaN(n)) return '---';
  const rounded = Math.round(n);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatCandleTime(timestamp: number | undefined): string {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const hours24 = d.getHours();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const hh = String(hours12).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${hh} ${ampm} ${dd}:${mm}`;
}

export default function CryptoChartCard() {
  const { isRefreshing, registerRefreshHandler } = useRefresh();
  const [selectedId, setSelectedId] = useState<'BTC' | 'ETH' | 'XAU'>('BTC');
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [dataMap, setDataMap] = useState<Record<string, TickerData>>({});
  const [loading, setLoading] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down' | null>>({});

  const flashTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const triggerPriceFlash = useCallback((id: string, direction: 'up' | 'down') => {
    if (flashTimeouts.current[id]) clearTimeout(flashTimeouts.current[id]);
    setFlashMap((prev) => ({ ...prev, [id]: direction }));
    flashTimeouts.current[id] = setTimeout(() => {
      setFlashMap((prev) => ({ ...prev, [id]: null }));
    }, 600);
  }, []);

  // 1. Initial 1-week H1 history loader (Binance Futures)
  const fetchBaselineData = async () => {
    const fetchOne = async (cfg: TickerConfig): Promise<{ id: string; data: TickerData } | null> => {
      try {
        const res = await fetch(cfg.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        if (!Array.isArray(raw) || raw.length === 0) return null;

        // Candle: [openTime, open, high, low, close, volume, ...]
        const candles: Candle[] = raw.map((c: (string | number)[]) => ({
          time: Number(c[0]),
          open: Number(c[1]),
          high: Number(c[2]),
          low: Number(c[3]),
          close: Number(c[4]),
        }));

        const current = candles[candles.length - 1].close;
        const idx1d = Math.max(0, candles.length - 25);
        const price1d = candles[idx1d].close;
        const price7d = candles[0].open;

        const change1d = ((current - price1d) / price1d) * 100;
        const change7d = ((current - price7d) / price7d) * 100;

        const highs = candles.map((c) => c.high);
        const lows = candles.map((c) => c.low);
        const high7d = Math.max(...highs);
        const low7d = Math.min(...lows);

        return {
          id: cfg.id,
          data: {
            candles,
            current,
            price1d,
            change1d,
            price7d,
            change7d,
            high7d,
            low7d,
            lastTickTime: Date.now(),
          },
        };
      } catch {
        return null;
      }
    };

    const results = await Promise.all(TICKERS.map(fetchOne));
    const nextMap: Record<string, TickerData> = {};
    results.forEach((r) => {
      if (r) nextMap[r.id] = r.data;
    });

    if (Object.keys(nextMap).length > 0) {
      setDataMap((prev) => ({ ...prev, ...nextMap }));
    }
    setLoading(false);
  };

  // 2. Register baseline refresh handler with global pull-to-refresh
  useEffect(() => {
    return registerRefreshHandler('crypto-chart', async () => {
      setDataMap({});
      await fetchBaselineData();
    });
  }, [registerRefreshHandler]);

  // 3. Real-time Binance Futures WebSocket Stream (BTCUSDT, ETHUSDT, XAUUSDT)
  useEffect(() => {
    fetchBaselineData();

    let futuresWs: WebSocket | null = null;
    let isMounted = true;

    const connectFuturesWs = () => {
      try {
        const streamNames = TICKERS.map((t) => t.streamName).join('/');
        futuresWs = new WebSocket(`wss://fstream.binance.com/stream?streams=${streamNames}`);

        futuresWs.onmessage = (e) => {
          if (!isMounted) return;
          try {
            const msg = JSON.parse(e.data);
            const stream = msg.stream;
            const data = msg.data;
            if (!data || !data.c) return;

            const tickerId = stream.startsWith('btcusdt')
              ? 'BTC'
              : stream.startsWith('ethusdt')
              ? 'ETH'
              : stream.startsWith('xauusdt')
              ? 'XAU'
              : null;

            if (!tickerId) return;

            const newPrice = Number(data.c);

            setDataMap((prev) => {
              const cur = prev[tickerId];
              if (!cur) return prev;
              const prevP = cur.current;
              if (Math.round(prevP) !== Math.round(newPrice)) {
                triggerPriceFlash(tickerId, newPrice > prevP ? 'up' : 'down');
              }

              // Update latest candle (OHLC) in real-time
              const updatedCandles = [...cur.candles];
              if (updatedCandles.length > 0) {
                const last = updatedCandles[updatedCandles.length - 1];
                updatedCandles[updatedCandles.length - 1] = {
                  ...last,
                  close: newPrice,
                  high: Math.max(last.high, newPrice),
                  low: Math.min(last.low, newPrice),
                };
              }

              const change1d = ((newPrice - cur.price1d) / cur.price1d) * 100;
              const change7d = ((newPrice - cur.price7d) / cur.price7d) * 100;

              return {
                ...prev,
                [tickerId]: {
                  ...cur,
                  current: newPrice,
                  prevPrice: prevP,
                  candles: updatedCandles,
                  change1d,
                  change7d,
                  high7d: Math.max(cur.high7d, newPrice),
                  low7d: Math.min(cur.low7d, newPrice),
                  lastTickTime: Date.now(),
                },
              };
            });
          } catch {
            // Ignore
          }
        };

        futuresWs.onerror = () => {
          if (futuresWs) futuresWs.close();
        };

        futuresWs.onclose = () => {
          if (isMounted) {
            setTimeout(connectFuturesWs, 3000);
          }
        };
      } catch {
        // Handled
      }
    };

    connectFuturesWs();
    const pollTimer = setInterval(fetchBaselineData, 60000);

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
      if (futuresWs) futuresWs.close();
      Object.values(flashTimeouts.current).forEach(clearTimeout);
    };
  }, [triggerPriceFlash]);

  const activeData = isRefreshing ? undefined : dataMap[selectedId];

  // SVG Dimensions
  const chartWidth = 260;
  const chartHeight = 64;

  const NUM_VISIBLE_CANDLES = 36;

  // Render Data: Candlestick & Line paths (Latest 36 H1 candles for clear visibility)
  const chartPathData = useMemo(() => {
    if (!activeData || activeData.candles.length < 2) return null;
    const candles = activeData.candles.slice(-NUM_VISIBLE_CANDLES);
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const minP = Math.min(...lows);
    const maxP = Math.max(...highs);
    const range = maxP - minP || 1;

    // For 36 candles: body width ≈ 4.5px with clean 2.5px gaps
    const candleWidth = Math.max(3.5, (chartWidth / candles.length) * 0.64);

    const candleElements = candles.map((c, i) => {
      const x = (i / (candles.length - 1)) * (chartWidth - 10) + 5;
      const yHigh = chartHeight - ((c.high - minP) / range) * (chartHeight - 12) - 6;
      const yLow = chartHeight - ((c.low - minP) / range) * (chartHeight - 12) - 6;
      const yOpen = chartHeight - ((c.open - minP) / range) * (chartHeight - 12) - 6;
      const yClose = chartHeight - ((c.close - minP) / range) * (chartHeight - 12) - 6;

      const isGreen = c.close >= c.open;
      const color = isGreen ? '#10B981' : '#EF4444';
      const bodyY = Math.min(yOpen, yClose);
      const bodyH = Math.max(1.5, Math.abs(yOpen - yClose));

      return {
        x,
        yHigh,
        yLow,
        bodyY,
        bodyH,
        color,
        candle: c,
      };
    });

    // Line / Area Path
    const lineCoordinates = candles.map((c, i) => {
      const x = (i / (candles.length - 1)) * chartWidth;
      const y = chartHeight - ((c.close - minP) / range) * (chartHeight - 12) - 6;
      return { x, y };
    });

    let d = `M ${lineCoordinates[0].x.toFixed(1)} ${lineCoordinates[0].y.toFixed(1)}`;
    for (let i = 0; i < lineCoordinates.length - 1; i++) {
      const p0 = lineCoordinates[Math.max(0, i - 1)];
      const p1 = lineCoordinates[i];
      const p2 = lineCoordinates[i + 1];
      const p3 = lineCoordinates[Math.min(lineCoordinates.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    const areaD = `${d} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    return { candles, candleWidth, candleElements, lineCoordinates, lineD: d, areaD };
  }, [activeData, chartWidth, chartHeight]);

  const svgRef = useRef<SVGSVGElement>(null);

  const handlePointerMove = (clientX: number) => {
    if (!svgRef.current || !chartPathData) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = relX / rect.width;
    const count = chartPathData.candles.length;
    const idx = Math.min(count - 1, Math.max(0, Math.round(ratio * (count - 1))));
    setHoverIndex(idx);
  };

  const hasDraggedRef = useRef(false);
  const dragStartX = useRef(0);

  const is7dPos = (activeData?.change7d ?? 0) >= 0;
  const strokeColor = is7dPos ? '#10B981' : '#EF4444';
  const gradientId = `crypto-grad-${selectedId}`;

  const hoveredCandle =
    hoverIndex !== null && chartPathData?.candles[hoverIndex]
      ? chartPathData.candles[hoverIndex]
      : null;
  const displayPrice = hoveredCandle ? hoveredCandle.close : activeData?.current;

  return (
    <div
      className="card bento-full"
      style={{
        padding: '12px 14px 10px',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ─── 3 Ticker Selector Tabs ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 6,
          marginBottom: 10,
        }}
      >
        {TICKERS.map((t) => {
          const tData = isRefreshing ? undefined : dataMap[t.id];
          const isSelected = t.id === selectedId;
          const flash = flashMap[t.id];
          const flashColor = flash === 'up' ? '#10B981' : flash === 'down' ? '#EF4444' : undefined;

          // H1 price direction (green if up, red if down)
          const lastCandle = tData?.candles && tData.candles.length > 0 ? tData.candles[tData.candles.length - 1] : null;
          const isH1Up = lastCandle ? lastCandle.close >= lastCandle.open : true;

          // Soft green / soft red background tint
          const bgTint = tData
            ? isH1Up
              ? isSelected
                ? 'rgba(16, 185, 129, 0.16)'
                : 'rgba(16, 185, 129, 0.07)'
              : isSelected
              ? 'rgba(239, 68, 68, 0.16)'
              : 'rgba(239, 68, 68, 0.07)'
            : 'var(--color-surface-2, rgba(255,255,255,0.04))';

          const borderColor = tData
            ? isH1Up
              ? isSelected
                ? 'rgba(22, 163, 74, 0.40)'
                : 'rgba(22, 163, 74, 0.15)'
              : isSelected
              ? 'rgba(220, 38, 38, 0.40)'
              : 'rgba(220, 38, 38, 0.15)'
            : 'var(--color-border-2)';

          return (
            <button
              key={t.id}
              onClick={() => {
                setSelectedId(t.id);
                setHoverIndex(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 8px',
                borderRadius: 'var(--radius-sm, 6px)',
                background: bgTint,
                border: `1px solid ${borderColor}`,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <img
                  src={t.logo}
                  alt={t.name}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    objectFit: 'contain',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: isSelected ? 'var(--color-text-1)' : 'var(--color-text-2)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {t.id}
                </span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  fontFamily: 'var(--font-mono)',
                  color:
                    flashColor ||
                    (isH1Up ? (isSelected ? 'var(--color-success)' : 'var(--color-text-1)') : (isSelected ? 'var(--color-danger)' : 'var(--color-text-1)')),
                  transition: 'color 0.25s ease',
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                {tData ? formatVNNumber(tData.current) : '---'}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Active Chart & Price Comparisons ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          position: 'relative',
        }}
      >
        {/* Left: Current Price & 1D / 7D Deltas — STRICT FIXED WIDTH TO PREVENT JITTER */}
        <div
          style={{
            width: 106,
            minWidth: 106,
            maxWidth: 106,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {/* Main Price Row */}
          <div style={{ marginBottom: 2 }}>
            <span
              style={{
                fontSize: 17,
                fontWeight: 800,
                color:
                  flashMap[selectedId] === 'up'
                    ? 'var(--color-success)'
                    : flashMap[selectedId] === 'down'
                    ? 'var(--color-danger)'
                    : 'var(--color-text-1)',
                fontVariantNumeric: 'tabular-nums',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.02em',
                transition: 'color 0.25s ease',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {formatVNNumber(displayPrice)}
            </span>
          </div>

          {/* 1D and 7D or OHLC + Time Container — EXACT FIXED HEIGHT (36px) */}
          <div style={{ height: 36, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {hoveredCandle ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span
                  style={{
                    fontSize: 8.5,
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                    fontVariantNumeric: 'tabular-nums',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.01em',
                    lineHeight: 1.1,
                  }}
                >
                  {formatCandleTime(hoveredCandle.time)}
                </span>
                <div
                  style={{
                    fontSize: 8,
                    color: 'var(--color-text-3)',
                    fontVariantNumeric: 'tabular-nums',
                    fontFamily: 'var(--font-mono)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    rowGap: 1,
                    columnGap: 2,
                    lineHeight: 1.1,
                  }}
                >
                  <span>O:{formatVNNumber(hoveredCandle.open)}</span>
                  <span>H:{formatVNNumber(hoveredCandle.high)}</span>
                  <span>L:{formatVNNumber(hoveredCandle.low)}</span>
                  <span
                    style={{
                      color: hoveredCandle.close >= hoveredCandle.open ? 'var(--color-success)' : 'var(--color-danger)',
                      fontWeight: 700,
                    }}
                  >
                    C:{formatVNNumber(hoveredCandle.close)}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* 1D ago */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontVariantNumeric: 'tabular-nums',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-3)', fontSize: 8.5, fontWeight: 600, width: 15 }}>1D</span>
                  <span
                    style={{
                      color: 'var(--color-text-2)',
                      fontWeight: 600,
                      fontSize: 9,
                      textAlign: 'right',
                    }}
                  >
                    {activeData ? formatVNNumber(activeData.price1d) : '...'}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 8.5,
                      color: (activeData?.change1d ?? 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                      textAlign: 'right',
                      minWidth: 38,
                    }}
                  >
                    {(activeData?.change1d ?? 0) >= 0 ? '+' : ''}
                    {activeData?.change1d?.toFixed(1)}%
                  </span>
                </div>

                {/* 7D ago */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontVariantNumeric: 'tabular-nums',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-3)', fontSize: 8.5, fontWeight: 600, width: 15 }}>7D</span>
                  <span
                    style={{
                      color: 'var(--color-text-2)',
                      fontWeight: 600,
                      fontSize: 9,
                      textAlign: 'right',
                    }}
                  >
                    {activeData ? formatVNNumber(activeData.price7d) : '...'}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 8.5,
                      color: (activeData?.change7d ?? 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                      textAlign: 'right',
                      minWidth: 38,
                    }}
                  >
                    {(activeData?.change7d ?? 0) >= 0 ? '+' : ''}
                    {activeData?.change7d?.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Interactive 1-Week H1 Candlestick / Line SVG Chart — Click chart to toggle Candle/Line */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            height: chartHeight,
            position: 'relative',
            cursor: 'pointer',
          }}
          title={chartType === 'candle' ? 'Đang hiển thị Nến Nhật — Nhấn để chuyển sang Đường' : 'Đang hiển thị Đường — Nhấn để chuyển sang Nến Nhật'}
          onClick={() => {
            if (!hasDraggedRef.current) {
              setChartType((prev) => (prev === 'candle' ? 'line' : 'candle'));
            }
          }}
          onMouseDown={(e) => {
            hasDraggedRef.current = false;
            dragStartX.current = e.clientX;
          }}
          onMouseMove={(e) => {
            if (Math.abs(e.clientX - dragStartX.current) > 5) {
              hasDraggedRef.current = true;
            }
            handlePointerMove(e.clientX);
          }}
          onMouseLeave={() => {
            setHoverIndex(null);
            hasDraggedRef.current = false;
          }}
          onTouchStart={(e) => {
            hasDraggedRef.current = false;
            dragStartX.current = e.touches[0].clientX;
          }}
          onTouchMove={(e) => {
            if (Math.abs(e.touches[0].clientX - dragStartX.current) > 5) {
              hasDraggedRef.current = true;
            }
            handlePointerMove(e.touches[0].clientX);
          }}
          onTouchEnd={() => {
            setHoverIndex(null);
          }}
        >
          {loading && !chartPathData ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: 'var(--color-text-3)',
              }}
            >
              Đang kết nối Futures...
            </div>
          ) : chartPathData ? (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity="0.32" />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Candlestick Chart View */}
              {chartType === 'candle' && (
                <g>
                  {chartPathData.candleElements.map((el, i) => (
                    <g key={i} opacity={hoverIndex !== null && hoverIndex !== i ? 0.45 : 1}>
                      {/* Wick (Râu nến) */}
                      <line
                        x1={el.x}
                        y1={el.yHigh}
                        x2={el.x}
                        y2={el.yLow}
                        stroke={el.color}
                        strokeWidth={0.75}
                        strokeLinecap="round"
                      />
                      {/* Body (Thân nến) */}
                      <rect
                        x={el.x - chartPathData.candleWidth / 2}
                        y={el.bodyY}
                        width={chartPathData.candleWidth}
                        height={el.bodyH}
                        fill={el.color}
                        rx={0.3}
                      />
                    </g>
                  ))}
                </g>
              )}

              {/* Line Area Chart View */}
              {chartType === 'line' && (
                <g>
                  <path d={chartPathData.areaD} fill={`url(#${gradientId})`} />
                  <path
                    d={chartPathData.lineD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )}

              {/* Hover Crosshair */}
              {hoverIndex !== null && (
                <g>
                  {chartType === 'candle' && chartPathData.candleElements[hoverIndex] && (
                    <line
                      x1={chartPathData.candleElements[hoverIndex].x}
                      y1={0}
                      x2={chartPathData.candleElements[hoverIndex].x}
                      y2={chartHeight}
                      stroke="var(--color-text-1)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      opacity="0.6"
                    />
                  )}
                  {chartType === 'line' && chartPathData.lineCoordinates[hoverIndex] && (
                    <g>
                      <line
                        x1={chartPathData.lineCoordinates[hoverIndex].x}
                        y1={0}
                        x2={chartPathData.lineCoordinates[hoverIndex].x}
                        y2={chartHeight}
                        stroke="var(--color-text-1)"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        opacity="0.6"
                      />
                      <circle
                        cx={chartPathData.lineCoordinates[hoverIndex].x}
                        cy={chartPathData.lineCoordinates[hoverIndex].y}
                        r="3.5"
                        fill={strokeColor}
                        stroke="var(--color-surface)"
                        strokeWidth="1.5"
                      />
                    </g>
                  )}
                </g>
              )}
            </svg>
          ) : null}
        </div>
      </div>
    </div>
  );
}
