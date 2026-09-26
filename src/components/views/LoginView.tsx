'use client';

import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginView() {
  const { login } = useAuth();
  const [username, setUsername] = useState('huyproplus2004');
  const [password, setPassword] = useState('572004huypromax');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(username, password);
    if (!res.success) {
      setError(res.error || 'Đăng nhập không thành công!');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 20px',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: 'var(--shadow-accent)',
          }}
        >
          <Sparkles size={24} color="var(--color-accent-ink)" />
        </div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: 'var(--color-text-1)',
            letterSpacing: '-0.02em',
            marginBottom: 4,
          }}
        >
          Personal Manager
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-2)' }}>
          Hệ thống điều hành & quản lý công việc cá nhân
        </p>
      </div>

      {/* Login Card */}
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 380,
          padding: '26px 22px',
          boxShadow: 'var(--shadow-elevated)',
          borderRadius: 'var(--radius-lg, 16px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
          <ShieldCheck size={16} color="var(--color-accent)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Đăng nhập hệ thống
          </span>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Username Input */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--color-text-2)',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Tên đăng nhập
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                color="var(--color-text-3)"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username..."
                autoCapitalize="none"
                autoCorrect="off"
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 12px 0 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-2)',
                  fontSize: 13,
                  color: 'var(--color-text-1)',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--color-text-2)',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="var(--color-text-3)"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                style={{
                  width: '100%',
                  height: 42,
                  padding: '0 12px 0 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-2)',
                  fontSize: 13,
                  color: 'var(--color-text-1)',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            style={{
              marginTop: 8,
              height: 42,
              padding: '0 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-accent)',
              color: 'var(--color-accent-ink)',
              border: 'none',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-accent)',
              transition: 'background-color 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div
          style={{
            marginTop: 20,
            paddingTop: 14,
            borderTop: '1px solid var(--color-border-2)',
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--color-text-3)',
            lineHeight: 1.4,
          }}
        >
          Tài khoản được cấp độc quyền bởi Quản trị viên (Admin).
        </div>
      </div>
    </div>
  );
}

