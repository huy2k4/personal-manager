export default function Home() {
  return (
    <main className="main-container">
      <div className="glow-orb" aria-hidden="true" />
      
      <div className="card">
        <div className="badge">
          <span className="badge-dot" />
          <span>Next.js Ready</span>
        </div>

        <h1 className="title">Hello World!</h1>

        <p className="subtitle">
          Dự án <strong>Personal Manager</strong> đã được khởi tạo thành công với Next.js và TypeScript. Sẵn sàng để phát triển các tính năng tiếp theo.
        </p>

        <div className="meta-grid">
          <div className="meta-item">
            <span className="meta-label">Framework</span>
            <span className="meta-value">Next.js 16 (App Router)</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Language</span>
            <span className="meta-value">TypeScript 5</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Repo</span>
            <span className="meta-value">huy2k4/personal-manager</span>
          </div>
        </div>
      </div>

      <p className="footer-text">
        Chạy <code>npm run dev</code> để bắt đầu môi trường phát triển local.
      </p>
    </main>
  );
}
