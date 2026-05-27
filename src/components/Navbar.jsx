import React from 'react';
import { Leaf, LogOut, ShoppingBag, User, Languages, Scan, LayoutDashboard, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar({ user, onLogout, activeTab, setActiveTab }) {
  const { lang, toggleLanguage, t } = useLanguage();
  return (
    <nav style={styles.nav} className="glass-panel navbar">
      <div style={styles.brand} className="nav-brand">
        <div style={styles.logoCircle}>
          <Leaf size={18} color="#fff" />
        </div>
        <h2 style={styles.logoText}>Kisan<span>Connect</span></h2>
      </div>

      {user && setActiveTab && (
        <div style={styles.navLinks} className="nav-links">
          <button 
            style={{
              ...styles.navBtn, 
              background: activeTab === 'dashboard' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))' : 'transparent',
              color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-secondary)',
              border: activeTab === 'dashboard' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
              boxShadow: activeTab === 'dashboard' ? '0 4px 12px rgba(16, 185, 129, 0.1)' : 'none',
              padding: '0.5rem 1rem',
              borderRadius: '10px'
            }}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span style={{ fontWeight: activeTab === 'dashboard' ? '600' : '400' }}>{t('dashboard')}</span>
          </button>
          <button 
            style={{
              ...styles.navBtn, 
              background: activeTab === 'ai_scanner' ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(14, 165, 233, 0.05))' : 'transparent',
              color: activeTab === 'ai_scanner' ? '#06b6d4' : 'var(--text-secondary)',
              border: activeTab === 'ai_scanner' ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
              boxShadow: activeTab === 'ai_scanner' ? '0 4px 12px rgba(6, 182, 212, 0.15)' : 'none',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              position: 'relative'
            }}
            onClick={() => setActiveTab('ai_scanner')}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scan size={18} color={activeTab === 'ai_scanner' ? "#06b6d4" : "currentColor"} />
              <Sparkles size={10} color={activeTab === 'ai_scanner' ? "#38bdf8" : "currentColor"} style={{ position: 'absolute', top: -3, right: -4, animation: 'pulse 1.5s infinite' }} />
            </div>
            <span style={{ fontWeight: activeTab === 'ai_scanner' ? '600' : '400', marginLeft: '4px' }}>{t('crop_ai')}</span>
            {activeTab !== 'ai_scanner' && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-10px', background: 'linear-gradient(90deg, #06b6d4, #0ea5e9)', 
                color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold', 
                boxShadow: '0 2px 4px rgba(6, 182, 212, 0.4)'
              }}>AI</span>
            )}
          </button>
        </div>
      )}

      {user && (
        <div style={styles.userMenu} className="user-menu">
          <div style={styles.userInfo} className="user-info">
            <div style={styles.userIcon}>
              {user.role === 'farmer' ? <Leaf size={14} color="var(--primary)" /> : <ShoppingBag size={14} color="var(--accent)" />}
            </div>
            <div style={styles.userText} className="hide-on-mobile">
              <span style={styles.userName}>{user.name}</span>
              <span style={{
                ...styles.userRole,
                color: user.role === 'farmer' ? 'var(--primary-light)' : 'var(--accent)'
              }}>
                {user.role === 'farmer' ? t('login_farmer') : t('login_buyer')}
              </span>
            </div>
          </div>

          <button onClick={toggleLanguage} style={{...styles.logoutBtn, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)'}} title="Change Language">
            <Languages size={16} />
            <span style={{...styles.logoutText, color: 'var(--primary)'}}>{lang === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
          
          <button onClick={onLogout} style={styles.logoutBtn} title="Log Out / Switch User">
            <LogOut size={16} color="var(--text-secondary)" />
            <span style={styles.logoutText} className="hide-on-mobile">{t('logout')}</span>
          </button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.85rem 2rem',
    borderRadius: '0 0 16px 16px',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    margin: '0 auto 1.5rem auto',
    width: '100%',
    maxWidth: '1200px',
    boxShadow: 'var(--shadow-sm)',
    background: 'rgba(18, 26, 22, 0.85)'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem'
  },
  logoCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 0 8px rgba(16, 185, 129, 0.3)'
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.3px',
    span: {
      color: 'var(--primary)'
    }
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.02)',
    padding: '0.4rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.04)'
  },
  userIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userText: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  },
  userName: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#fff',
    lineHeight: '1.2'
  },
  userRole: {
    fontSize: '0.65rem',
    fontWeight: '600'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.4rem 0.6rem',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.05)'
    }
  },
  logoutText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '500'
  }
};
