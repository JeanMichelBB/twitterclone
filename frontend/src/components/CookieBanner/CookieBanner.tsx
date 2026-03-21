import { useState, useEffect } from 'react';
import './CookieBanner.css';

const TECH_STACK = [
  { name: 'React',       color: '#61DAFB', bg: 'rgba(97,218,251,0.1)',  icon: '⚛️' },
  { name: 'TypeScript',  color: '#3178C6', bg: 'rgba(49,120,198,0.1)',  icon: '🔷' },
  { name: 'FastAPI',     color: '#00C4A1', bg: 'rgba(0,196,161,0.1)',   icon: '⚡' },
  { name: 'Python',      color: '#FFD43B', bg: 'rgba(255,212,59,0.1)',  icon: '🐍' },
  { name: 'MySQL',       color: '#F29111', bg: 'rgba(242,145,17,0.1)',  icon: '🐬' },
];

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookieNoticeRead')) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem('cookieNoticeRead', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cb-overlay">
      <div className="cb-banner">

        <div className="cb-header">
          <span className="cb-logo">X</span>
          <div>
            <h3 className="cb-title">About This App</h3>
            <p className="cb-subtitle">No cookies are used on this platform</p>
          </div>
        </div>

        <p className="cb-notice">
          No cookies from us — your token lives in <code>localStorage</code> only.
          The GIF feature loads Giphy, which may set their own cookies on <code>.giphy.com</code> —
          see <a href="https://support.giphy.com/hc/en-us/articles/360032872931" target="_blank" rel="noreferrer">Giphy's privacy policy</a>.
        </p>

        <div className="cb-divider" />

        <p className="cb-stack-label">Built with</p>
        <div className="cb-badges">
          {TECH_STACK.map(({ name, color, bg, icon }) => (
            <span
              key={name}
              className="cb-badge"
              style={{ color, background: bg, borderColor: `${color}55` }}
            >
              {icon} {name}
            </span>
          ))}
          <span className="cb-badge cb-badge-giphy">✨ GIPHY</span>
        </div>

        <button className="cb-btn" onClick={dismiss}>Got it</button>
      </div>
    </div>
  );
};

export default CookieBanner;
