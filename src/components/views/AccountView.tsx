'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  TrendingUp,
  UserPlus,
  LogOut,
  Check,
  AlertCircle,
  Users,
  Settings,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import Badge from '@/components/ui/Badge';

export default function AccountView() {
  const { user, logout, updateFinanceToggle, createUserAccount } = useAuth();
  const [hasFinance, setHasFinance] = useState(user?.has_finance ?? true);
  const [isUpdatingFinance, setIsUpdatingFinance] = useState(false);

  // Admin section states
  const [usersList, setUsersList] = useState<Array<{ id: string; username: string; role: string; has_finance: boolean; created_at: string }>>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newHasFinance, setNewHasFinance] = useState(true);
  const [adminMsg, setAdminMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      setHasFinance(user.has_finance);
    }
  }, [user]);

  // Load user list for Admin
  const loadUsers = async () => {
    if (user?.role !== 'admin') return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, role, has_finance, created_at')
        .order('created_at', { ascending: false });
      if (data) setUsersList(data);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user]);

  const handleToggleFinance = async () => {
    const nextVal = !hasFinance;
    setHasFinance(nextVal);
    setIsUpdatingFinance(true);
    await updateFinanceToggle(nextVal);
    setIsUpdatingFinance(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      setAdminMsg({ type: 'error', text: 'Vui lòng nhập đầy đủ username và mật khẩu!' });
      return;
    }

    setIsCreating(true);
    setAdminMsg(null);

    const res = await createUserAccount({
      username: newUsername,
      password: newPassword,
      fullName: newFullName,
      hasFinance: newHasFinance,
    });

    setIsCreating(false);

    if (res.success) {
      setAdminMsg({ type: 'success', text: `Tạo tài khoản ${newUsername} thành công!` });
      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      loadUsers();
    } else {
      setAdminMsg({ type: 'error', text: res.error || 'Lỗi khi tạo tài khoản!' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* ─── 1. User Profile Card ─── */}
      <div className="card bento-full">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: user?.role === 'admin' ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : 'linear-gradient(135deg, #4B5563, #1F2937)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              }}
            >
              <User size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-1)' }}>
                  {user?.username}
                </span>
                <Badge variant={user?.role === 'admin' ? 'accent' : 'neutral'}>
                  {user?.role === 'admin' ? 'Admin' : 'User'}
                </Badge>
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-text-2)' }}>
                {user?.full_name || 'Hồ sơ người dùng'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-danger-bg)',
              border: '1px solid rgba(220, 38, 38, 0.15)',
              color: 'var(--color-danger)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Module Preferences (Finance Toggle) ─── */}
      <div className="card bento-full">
        <div className="card-header" style={{ marginBottom: 10 }}>
          <div className="card-title">
            <Settings size={14} color="var(--color-accent)" />
            <span>Tùy chỉnh Mô-đun Menu</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: hasFinance ? 'var(--color-accent-bg)' : 'var(--color-border-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: hasFinance ? 'var(--color-accent)' : 'var(--color-text-3)',
              }}
            >
              <TrendingUp size={16} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)' }}>
                Mô-đun Tài chính (Finance)
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>
                {hasFinance ? 'Đang hiển thị mục "Tài chính" trên thanh Menu' : 'Đã ẩn mục "Tài chính" khỏi Menu'}
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleFinance}
            disabled={isUpdatingFinance}
            style={{
              width: 44,
              height: 24,
              borderRadius: 99,
              background: hasFinance ? 'var(--color-accent)' : 'var(--color-border)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s ease',
              padding: 2,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#FFFFFF',
                transform: hasFinance ? 'translateX(20px)' : 'translateX(0px)',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
              }}
            />
          </button>
        </div>
      </div>

      {/* ─── 3. Admin Panel (Chỉ Admin mới thấy) ─── */}
      {user?.role === 'admin' && (
        <div className="card bento-full">
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title">
              <Shield size={14} color="var(--color-accent)" />
              <span>Quản trị viên — Thêm tài khoản</span>
            </div>
          </div>

          {adminMsg && (
            <div
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                background: adminMsg.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                color: adminMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {adminMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
              <span>{adminMsg.text}</span>
            </div>
          )}

          {/* Form thêm user */}
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-2)', marginBottom: 4 }}>
                  TÊN ĐĂNG NHẬP
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="VD: nguyenvana"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    fontSize: 12,
                    color: 'var(--color-text-1)',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-2)', marginBottom: 4 }}>
                  MẬT KHẨU
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    fontSize: 12,
                    color: 'var(--color-text-1)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-2)', marginBottom: 4 }}>
                HỌ & TÊN / BIỆT DANH
              </label>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-2)',
                  fontSize: 12,
                  color: 'var(--color-text-1)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-2)' }}>Bật mô-đun Tài chính cho user này:</span>
              <input
                type="checkbox"
                checked={newHasFinance}
                onChange={(e) => setNewHasFinance(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-accent)' }}
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              style={{
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-accent)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: isCreating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <UserPlus size={14} />
              <span>{isCreating ? 'Đang tạo...' : 'Tạo tài khoản'}</span>
            </button>
          </form>

          {/* Danh sách người dùng hiện tại */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', marginBottom: 6 }}>
              Danh sách tài khoản ({usersList.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {usersList.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border-2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-1)' }}>
                      {u.username}
                    </span>
                    <Badge variant={u.role === 'admin' ? 'accent' : 'neutral'}>
                      {u.role}
                    </Badge>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>
                    {u.has_finance ? 'Có Tài chính' : 'Không Tài chính'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
