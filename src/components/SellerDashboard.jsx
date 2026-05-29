import React, { useState, useEffect } from 'react';
import { Leaf, Plus, TrendingUp, AlertCircle, Truck, Phone, MapPin, DollarSign, Calendar, MessageSquare, Loader, Trash2 } from 'lucide-react';
import WeatherWidget from './WeatherWidget';
import { useLanguage } from '../contexts/LanguageContext';
import { createListing } from '../utils/apiClient';

const GOV_API_KEY = '579b464db66ec23bdd000001a44e89e8e38a4537575909cb6d2e957e';
const GOV_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

export default function SellerDashboard({ user, listings, onAddListing, onDeleteListing, chats, onOpenChat, transactions = [] }) {
  const { t } = useLanguage();
  const [crop, setCrop] = useState('Wheat (Kanak)');
  const [customCrop, setCustomCrop] = useState('');
  const [finalCustomCrop, setFinalCustomCrop] = useState('');
  const [quantity, setQuantity] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [grade, setGrade] = useState('Grade A Premium');
  const [shareTruck, setShareTruck] = useState(true);
  const [photo, setPhoto] = useState(null); // NEW: Photo state
  
  // Smart Data Calculations
  const [mandiRate, setMandiRate] = useState({ current: 0, trend: 'stable' });
  const [isFetchingMandi, setIsFetchingMandi] = useState(false);
  const [priceDiff, setPriceDiff] = useState(0);
  const [predictedIncrease, setPredictedIncrease] = useState(150);

  const triggerMockWhatsApp = () => {
    const message = `Namaste theFarmoSpan! Main ${user.name} hu. Mujhe apne ${user.location} location ke liye ${crop} ke daily price alerts chahiye.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };
  
  // Dynamically calculate "Next Week" date instead of hardcoded 'June 1st'
  const getNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };
  const [predictionMonth, setPredictionMonth] = useState(getNextWeekDate());

  const getRealisticFallbackPrice = (cropName) => {
    if (!cropName) return 2200;
    const c = cropName.toLowerCase();
    if (c.includes('sugarcane') || c.includes('ganna')) return 350;
    if (c.includes('cotton') || c.includes('kapas')) return 7000;
    if (c.includes('soyabean') || c.includes('soya')) return 4500;
    if (c.includes('mustard') || c.includes('sarso')) return 5000;
    if (c.includes('potato') || c.includes('aloo')) return 1500;
    if (c.includes('onion') || c.includes('pyaz')) return 2000;
    if (c.includes('tomato') || c.includes('tamatar')) return 2500;
    if (c.includes('rice') || c.includes('paddy') || c.includes('dhan')) return 2100;
    if (c.includes('wheat') || c.includes('kanak')) return 2200;
    if (c.includes('corn') || c.includes('maize') || c.includes('makka')) return 2000;
    
    // Hash for completely unknown crops so they get somewhat varying prices between 1000 and 5000
    let hash = 0;
    for (let i = 0; i < c.length; i++) {
      hash = ((hash << 5) - hash) + c.charCodeAt(i);
      hash = hash & hash;
    }
    return 1000 + (Math.abs(hash) % 4000);
  };

  // Fetch Live Mandi Rates from Gov API when Crop changes
  useEffect(() => {
    const fetchLiveRate = async () => {
      // Don't fetch if "Other" is selected but finalCustomCrop is empty
      if (crop === 'Other' && !finalCustomCrop) {
        setMandiRate({ current: 0, trend: 'stable' });
        setPriceDiff(0);
        return;
      }

      setIsFetchingMandi(true);
      
      // Extract base crop for API search (e.g. "Wheat (Kanak)" -> "Wheat")
      let searchCrop = crop === 'Other' ? finalCustomCrop : crop.split(' (')[0];
      if (searchCrop === 'Rice') searchCrop = 'Paddy(Dhan)'; // Gov API uses Paddy for Rice
      
      try {
        const url = `https://api.data.gov.in/resource/${GOV_RESOURCE_ID}?api-key=${GOV_API_KEY}&format=json&filters[commodity]=${searchCrop}&limit=1`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && data.records && data.records.length > 0) {
          const livePrice = parseInt(data.records[0].modal_price);
          setMandiRate({
            current: livePrice,
            trend: 'up',
            location: data.records[0].market + ", " + data.records[0].state
          });
        } else {
          // Fallback if no data found for the day
          setMandiRate({ current: getRealisticFallbackPrice(searchCrop), trend: 'stable', location: 'AI Estimate' });
        }
      } catch (err) {
        console.error("Gov API failed", err);
        setMandiRate({ current: getRealisticFallbackPrice(searchCrop), trend: 'down', location: 'Offline AI Mode' });
      } finally {
        setIsFetchingMandi(false);
      }
    };
    
    fetchLiveRate();
  }, [crop, finalCustomCrop]);

  // Recalculate price comparisons when Crop or Asking Price changes
  useEffect(() => {
    if (askingPrice && mandiRate.current > 0) {
      const diff = askingPrice - mandiRate.current;
      setPriceDiff(diff);
    } else {
      setPriceDiff(0);
    }
  }, [askingPrice, mandiRate]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || !askingPrice) return;
    
    setIsSubmitting(true);

    let photoBase64 = null;
    if (photo) {
      try {
        photoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                  if (width > MAX_WIDTH) {
                    height = Math.round((height *= MAX_WIDTH / width));
                    width = MAX_WIDTH;
                  }
                } else {
                  if (height > MAX_HEIGHT) {
                    width = Math.round((width *= MAX_HEIGHT / height));
                    height = MAX_HEIGHT;
                  }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
              } catch (err) {
                // If canvas fails (memory/security), fallback to raw base64
                resolve(event.target.result);
              }
            };
            img.onerror = () => resolve(event.target.result); // Fallback if image parse fails
            img.src = event.target.result;
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(photo);
        });
      } catch (e) {
        photoBase64 = null;
      }
    }

    const finalCropName = crop === 'Other' ? customCrop || 'Unknown Crop' : crop;

    const newListing = {
      farmerId: user._id,
      farmerName: user.name,
      crop: finalCropName,
      quantity: parseFloat(quantity),
      askingPrice: parseFloat(askingPrice),
      location: user.location,
      contact: user.phone,
      grade,
      shareTruckPool: shareTruck,
      photoUrl: photoBase64
    };

    try {
      const savedListing = await createListing(newListing);
      onAddListing(savedListing);
      // Reset form
      setQuantity('');
      setAskingPrice('');
      setCustomCrop('');
    } catch (err) {
      console.error('Failed to create listing', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter listings made by this farmer
  const myListings = listings.filter(l => l.farmerId === user._id);

  const myTransactions = transactions.filter(t => t.farmerId === user._id);
  const latestSale = myTransactions.length > 0 ? myTransactions[0] : null;

  return (
    <div style={styles.container} className="animate-fade">
      
      {/* Dynamic Notification Banner (NEW) */}
      {latestSale && (
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)', animation: 'slideDown 0.5s ease-out' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '50%' }}>
            <DollarSign size={24} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>🎉 Payment Received!</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
              You just sold <strong>{latestSale.crop}</strong> for <strong>₹{latestSale.amount}</strong> via {latestSale.method}. Check your Sales History below!
            </p>
          </div>
        </div>
      )}

      {/* Top Section: Profile & Smart Data */}
      <div style={styles.topGrid} className="mobile-grid">
        
        {/* Profile Card */}
        <div style={styles.profileCard} className="glass-panel">
          <div style={styles.avatar}>
            <Leaf size={28} color="#fff" />
          </div>
          <div style={styles.profileDetails}>
            <span style={styles.roleBadge} className="badge badge-primary">Seller (Farmer)</span>
            <h3 style={styles.profileName}>{user.name}</h3>
            <div style={styles.infoRow}>
              <MapPin size={16} color="var(--text-secondary)" />
              <span>{user.location}</span>
            </div>
            <div style={styles.infoRow}>
              <Phone size={16} color="var(--text-secondary)" />
              <span>{user.phone}</span>
            </div>
          </div>
        </div>

        {/* AI & Smart Advisory Card */}
        <div style={styles.advisoryCard} className="glass-panel">
          <div style={styles.cardHeader}>
            <TrendingUp size={20} color="var(--accent)" />
            <h4 style={styles.advisoryTitle}>AI Smart Data Advisory</h4>
          </div>
          
          <div style={styles.advisoryBody}>
            {/* Mandi Rate Compare */}
            <div style={styles.advisoryWidget}>
              <span style={styles.widgetLabel}>Live Gov. Mandi Rate (AGMARKNET)</span>
              <div style={styles.mandiBox}>
                <div style={styles.mandiRateVal}>
                  {isFetchingMandi ? (
                    <Loader size={20} className="animate-spin" color="var(--primary)" />
                  ) : (
                    <>₹{mandiRate.current} <span style={styles.perUnit}>/ quintal</span></>
                  )}
                </div>
                {!isFetchingMandi && (
                  <span style={{
                    ...styles.trendBadge,
                    color: mandiRate.trend === 'up' ? '#34d399' : mandiRate.trend === 'down' ? '#f87171' : '#fbbf24'
                  }}>
                    {mandiRate.trend === 'up' ? '▲ Upward' : mandiRate.trend === 'down' ? '▼ Downward' : '● Stable'}
                  </span>
                )}
              </div>
              {!isFetchingMandi && mandiRate.location && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  Ref: {mandiRate.location}
                </span>
              )}
            </div>

            {/* AI Prediction */}
            <div style={styles.advisoryWidget}>
              <span style={styles.widgetLabel}>AI Price Forecast (Optimal Time)</span>
              <div style={styles.predictionBox}>
                <div style={styles.predictedVal}>
                  Predicted <span style={{ color: 'var(--accent)' }}>+₹{predictedIncrease}/q</span> next week
                </div>
                <div style={styles.predictionDate}>
                  Optimal Selling Window: <Calendar size={12} style={{ display: 'inline', margin: '0 4px' }} /> <strong style={{ color: '#fff' }}>{predictionMonth}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Weather Widget */}
        <WeatherWidget location={user.location} />

      </div>

      {/* Main Content Grid */}
      <div style={styles.mainGrid} className="mobile-grid">
        
        {/* Upload Crop Details Form */}
        <div style={styles.formCard} className="glass-panel">
          <h3 style={styles.sectionTitle}>
            <Plus size={18} style={{ marginRight: '6px' }} />
            {t('upload_crop')}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('crop_name')}</label>
              <select
                className="form-select"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              >
                <option value="Wheat (Kanak)">Wheat (Kanak)</option>
                <option value="Wheat (Sarbati)">Wheat (Sarbati)</option>
                <option value="Rice (Basmati)">Rice (Basmati)</option>
                <option value="Cotton">Cotton</option>
                <option value="Onion">Onion</option>
                <option value="Tomato">Tomato</option>
                <option value="Other">Other (Specify)</option>
              </select>
            </div>
            
            {crop === 'Other' && (
              <div className="form-group" style={{ marginTop: '-0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type your crop name here..."
                  value={customCrop}
                  onChange={(e) => setCustomCrop(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setFinalCustomCrop(customCrop);
                    }
                  }}
                  onBlur={() => setFinalCustomCrop(customCrop)}
                  required
                />
              </div>
            )}

            <div style={styles.formRow} className="mobile-form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">{t('quantity')}</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">{t('price')}</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 2100"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('grade')}</label>
              <select 
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="form-select"
              >
                <option value="Grade A Premium">Grade A (Premium)</option>
                <option value="Grade B Standard">Grade B (Standard)</option>
                <option value="Grade C Processing">Grade C (Processing)</option>
              </select>
            </div>

            {/* NEW: Photo Upload Field */}
            <div className="form-group">
              <label className="form-label">Upload Crop Photo (Optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPhoto(e.target.files[0]);
                    }
                  }}
                  style={{
                    padding: '0.5rem',
                    border: '1px dashed var(--border)',
                    borderRadius: '8px',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                />
                {photo && (
                  <img 
                    src={URL.createObjectURL(photo)} 
                    alt="preview" 
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                )}
              </div>
            </div>

            {/* Smart Pricing Indicator */}
            {askingPrice && (
              <div style={{
                ...styles.priceComparison,
                borderColor: priceDiff > 100 ? '#f59e0b' : '#10b981',
                background: priceDiff > 100 ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 185, 129, 0.05)'
              }}>
                <AlertCircle size={18} color={priceDiff > 100 ? 'var(--accent)' : 'var(--primary)'} />
                <span style={{ fontSize: '0.85rem' }}>
                  {priceDiff > 0 ? (
                    <>Aapki asking price Mandi Rate se <strong>₹{priceDiff}/q</strong> zyada hai. AI suggests bargaining space.</>
                  ) : priceDiff < 0 ? (
                    <>Aapki price Mandi rate se <strong>₹{Math.abs(priceDiff)}/q</strong> kam hai. Fast sale recommended!</>
                  ) : (
                    <>Price matches current Mandi rate perfectly!</>
                  )}
                </span>
              </div>
            )}

            {/* Truck Sharing Toggle */}
            <div style={styles.truckToggle}>
              <div style={styles.truckLeft}>
                <Truck size={18} color="var(--primary-light)" />
                <div>
                  <h5 style={styles.truckLabel}>Logistics Pooling</h5>
                  <p style={styles.truckDesc}>Share a Truck pool option with nearby farmers</p>
                </div>
              </div>
              <input
                type="checkbox"
                style={styles.toggleCheckbox}
                checked={shareTruck}
                onChange={(e) => setShareTruck(e.target.checked)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}>
              {isSubmitting ? <><Loader size={18} className="animate-spin" /> Uploading...</> : <><Plus size={18} /> {t('post_listing')}</>}
            </button>
          </form>
        </div>

        {/* Listings & Conversations Side */}
        <div style={styles.listingsSide}>
          
          {/* Active Chats Hub */}
          <div style={styles.chatHub} className="glass-panel">
            <h3 style={styles.sectionTitle}>
              <MessageSquare size={18} style={{ marginRight: '6px' }} color="var(--accent)" />
              {t('negotiation_chats')}
            </h3>
            {chats.length === 0 ? (
              <div style={styles.emptyText}>No active bargaining inquiries yet.</div>
            ) : (
              <div style={styles.chatList}>
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    style={styles.chatItem}
                    onClick={() => onOpenChat(chat)}
                  >
                    <div style={styles.chatInfo}>
                      <span style={styles.chatBuyer}>{chat.buyerName}</span>
                      <span style={styles.chatCrop}>Inquiry: {chat.crop}</span>
                      <span style={styles.chatSnippet}>
                        {chat.messages[chat.messages.length - 1]?.text}
                      </span>
                    </div>
                    <button className="btn btn-secondary" style={styles.chatBtn}>
                      Bargain
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Listed Products */}
          <div style={styles.myListingsCard} className="glass-panel">
            <h3 style={styles.sectionTitle}>
              <Leaf size={18} style={{ marginRight: '6px' }} color="var(--primary)" />
              {t('my_listings')} ({myListings.length})
            </h3>
            {myListings.length === 0 ? (
              <div style={styles.emptyText}>No crop listed yet. Use form on left.</div>
            ) : (
              <div style={styles.myListingsGrid}>
                {myListings.map(lst => (
                  <div key={lst.id || lst._id} style={styles.myListingItem}>
                    <div style={styles.lstHeader}>
                      <span style={styles.cropTitle}>{lst.crop}</span>
                      <span className="badge badge-primary">{lst.grade}</span>
                    </div>
                    <div style={styles.lstBody}>
                      <div>Qty: <strong>{lst.quantity} Quintal</strong></div>
                      <div>Price: <strong style={{ color: 'var(--accent)' }}>₹{lst.askingPrice}/q</strong></div>
                    </div>
                    <div style={styles.lstFooter}>
                      <span style={styles.lstLocation}><MapPin size={12} /> {lst.location}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {lst.shareTruckPool && <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>Truck Pool Active</span>}
                        <button 
                          onClick={() => onDeleteListing(lst._id || lst.id)} 
                          style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Remove Listing"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction History (NEW) */}
          <div style={{...styles.myListingsCard, marginTop: '0rem'}} className="glass-panel">
            <h3 style={styles.sectionTitle}>
              <DollarSign size={18} style={{ marginRight: '6px' }} color="#10b981" />
              My Sales History
            </h3>
            {transactions.filter(t => t.farmerId === user._id).length === 0 ? (
              <div style={styles.emptyText}>No sales recorded yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {transactions.filter(t => t.farmerId === user._id).map(tx => (
                  <div key={tx.id} style={{...styles.myListingItem, borderLeft: '4px solid #10b981'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#fff' }}>Sold {tx.crop}</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>+₹{tx.amount}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span>To Buyer ID: {tx.buyerId.substring(0, 6)}...</span>
                      <span>{tx.date} • {tx.method}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem'
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1.5rem',
    textAlign: 'left'
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  roleBadge: {
    width: 'fit-content',
    fontSize: '0.7rem'
  },
  profileName: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#fff'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },
  advisoryCard: {
    padding: '1.5rem',
    textAlign: 'left'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.5rem',
    marginBottom: '0.75rem'
  },
  advisoryTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff'
  },
  advisoryBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  advisoryWidget: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  widgetLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  mandiBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  mandiRateVal: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#fff'
  },
  perUnit: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: 'normal'
  },
  trendBadge: {
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  predictionBox: {
    display: 'flex',
    flexDirection: 'column'
  },
  predictedVal: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff'
  },
  predictionDate: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '0.1rem'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1.5fr',
    gap: '1.5rem',
    alignItems: 'start'
  },
  formCard: {
    padding: '1.5rem',
    textAlign: 'left'
  },
  sectionTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.15rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center'
  },
  formRow: {
    display: 'flex',
    gap: '1rem'
  },
  priceComparison: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: '10px',
    borderWidth: '1px',
    borderStyle: 'solid',
    marginBottom: '1rem'
  },
  truckToggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.02)',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.03)',
    marginBottom: '1rem'
  },
  truckLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  truckLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff'
  },
  truckDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  toggleCheckbox: {
    width: '40px',
    height: '20px',
    accentColor: 'var(--primary)',
    cursor: 'pointer'
  },
  listingsSide: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  chatHub: {
    padding: '1.5rem',
    textAlign: 'left'
  },
  myListingsCard: {
    padding: '1.5rem',
    textAlign: 'left'
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    textAlign: 'center',
    padding: '2rem'
  },
  myListingsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  myListingItem: {
    padding: '0.85rem',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  lstHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cropTitle: {
    fontWeight: '600',
    color: '#fff'
  },
  lstBody: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },
  lstFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: '0.4rem',
    marginTop: '0.2rem'
  },
  lstLocation: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem'
  },
  chatList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  chatItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.85rem',
    borderRadius: '10px',
    background: 'rgba(16, 185, 129, 0.04)',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  chatInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    textAlign: 'left'
  },
  chatBuyer: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff'
  },
  chatCrop: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  chatSnippet: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    maxWidth: '280px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  chatBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem'
  }
};
