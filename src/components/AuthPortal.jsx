import React, { useState } from 'react';
import { Leaf, ShoppingBag, ArrowRight, MapPin, User, Phone, CheckCircle } from 'lucide-react';
import { loginUser } from '../utils/apiClient';
import { useLanguage } from '../contexts/LanguageContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function AuthPortal({ onLoginSuccess }) {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('farmer'); // 'farmer' (Seller) or 'buyer'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      let userLocation = location;
      
      const finalizeLogin = (finalLocation) => {
        const profile = {
          _id: 'g_' + decoded.sub,
          name: decoded.name,
          role: role,
          location: finalLocation || (role === 'farmer' ? 'Bhopal' : 'Delhi'),
          phone: 'Verified via Google',
          email: decoded.email
        };
        onLoginSuccess(profile);
      };

      // If user didn't type a location, try to get GPS
      if (!userLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Reverse Geocode using OpenWeather API
              const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&limit=1&appid=3702d85e96009bbc3e82425c15a2dba3`);
              const data = await res.json();
              if (data && data.length > 0) {
                userLocation = data[0].name;
              }
            } catch (e) {
              console.error("Geocoding failed", e);
            }
            finalizeLogin(userLocation);
          },
          (error) => {
            console.error("GPS Denied/Failed", error);
            finalizeLogin(userLocation); // Proceed with fallback
          },
          { timeout: 5000 }
        );
      } else {
        // User already typed a location, or geolocation not supported
        finalizeLogin(userLocation);
      }

    } catch (err) {
      setError('Google login failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !location.trim()) {
      setError('Please fill all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await loginUser({ name, phone, location, role });
      onLoginSuccess(user);
    } catch (err) {
      setError('Server Error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade">
      <div style={styles.authBox} className="glass-panel">
        
        {/* App Logo */}
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          </div>
          <h1 style={styles.title}>theFarmo<span>Span</span></h1>
          <p style={styles.subtitle}>Direct Farmer-to-Market Digital Network</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={styles.formDesc}>
            {t('join_network')}
          </p>

          {error && <div style={styles.errorAlert}>{error}</div>}

          {/* Role Switcher */}
          <div style={styles.roleContainer}>
            <span className="form-label" style={{ marginBottom: '0.4rem' }}>{t('select_role')}:</span>
            <div style={styles.roleTabs}>
              <button
                type="button"
                style={{
                  ...styles.roleTab,
                  ...(role === 'farmer' ? styles.activeFarmerTab : {})
                }}
                onClick={() => setRole('farmer')}
              >
                <Leaf size={18} style={{ marginRight: '6px' }} />
                {t('farmer_seller')}
              </button>
              <button
                type="button"
                style={{
                  ...styles.roleTab,
                  ...(role === 'buyer' ? styles.activeBuyerTab : {})
                }}
                onClick={() => setRole('buyer')}
              >
                <ShoppingBag size={18} style={{ marginRight: '6px' }} />
                {t('buyer_merchant')}
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">{t('full_name')}</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                className="form-input"
                placeholder={t('enter_name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          {/* Contact Number */}
          <div className="form-group">
            <label className="form-label">{t('mobile_number')}</label>
            <div style={styles.inputWrapper}>
              <Phone size={18} style={styles.inputIcon} />
              <input
                type="tel"
                className="form-input"
                placeholder={t('enter_phone')}
                maxLength="10"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">{t('location')}</label>
            <div style={styles.inputWrapper}>
              <MapPin size={18} style={styles.inputIcon} />
              <input
                type="text"
                className="form-input"
                placeholder={t('enter_location')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading}>
            {loading ? t('connecting') : t('login_btn')}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={styles.socialLogin}>
          <p style={styles.socialText}>{t('orContinueWith')}</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log('Login Failed');
                alert('Google Login Failed. Please try again or use regular login.');
              }}
              shape="pill"
              theme="outline"
              size="large"
            />
          </div>
        </div>

        {/* Benefits list depending on chosen role */}
        <div style={styles.features}>
          <h4 style={styles.featuresTitle}>{t('why_connect')}</h4>
          {role === 'farmer' ? (
            <div style={styles.featureList}>
              <div style={styles.featureItem}>
                <CheckCircle size={14} color="#10b981" />
                <span>Simulate AI Price Prediction to sell at peak rates</span>
              </div>
              <div style={styles.featureItem}>
                <CheckCircle size={14} color="#10b981" />
                <span>Truck Pool sharing option with nearby farmers</span>
              </div>
              <div style={styles.featureItem}>
                <CheckCircle size={14} color="#10b981" />
                <span>Direct direct negotiation with verified buyers</span>
              </div>
            </div>
          ) : (
            <div style={styles.featureList}>
              <div style={styles.featureItem}>
                <CheckCircle size={14} color="#f59e0b" />
                <span>Search wheat, rice, cotton directly from field</span>
              </div>
              <div style={styles.featureItem}>
                <CheckCircle size={14} color="#f59e0b" />
                <span>Bargain directly with farmers over price & quality</span>
              </div>
              <div style={styles.featureItem}>
                <CheckCircle size={14} color="#f59e0b" />
                <span>Filter by distance, price, and grade quality</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '85vh',
    padding: '2rem 1rem'
  },
  authBox: {
    width: '100%',
    maxWidth: '480px',
    padding: '2.5rem',
    textAlign: 'center',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    animation: 'pulse-glow 4s infinite'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  logoCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '1rem',
    boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    marginTop: '0.2rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem'
  },
  formDesc: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    marginBottom: '1.5rem'
  },
  errorAlert: {
    padding: '0.75rem 1rem',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '1.25rem',
    textAlign: 'left'
  },
  roleContainer: {
    marginBottom: '1.25rem',
    textAlign: 'left'
  },
  roleTabs: {
    display: 'flex',
    gap: '0.5rem',
    background: 'rgba(10, 15, 13, 0.6)',
    padding: '0.25rem',
    borderRadius: '10px',
    border: '1px solid var(--border-color)'
  },
  roleTab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.6rem 0.5rem',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeFarmerTab: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  activeBuyerTab: {
    background: 'rgba(245, 158, 11, 0.2)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.3)'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)'
  },
  submitBtn: {
    marginTop: '1rem',
    width: '100%',
    padding: '0.85rem',
    borderRadius: '10px'
  },
  features: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    textAlign: 'left'
  },
  featuresTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  }
};
