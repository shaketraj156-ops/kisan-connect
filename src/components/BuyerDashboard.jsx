import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Filter, MessageSquare, Phone, Truck, User, Eye, X, Image as ImageIcon, CreditCard, CheckCircle, Map as MapIcon, Navigation } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { openOrCreateChat } from '../utils/apiClient';

export default function BuyerDashboard({ user, listings, onOpenChat, activeChats, onAddTransaction, transactions = [] }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedListing, setSelectedListing] = useState(null); 
  const [showMap, setShowMap] = useState(false);
  
  // Payment State
  const [paymentListing, setPaymentListing] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter listings based on user inputs
  const filteredListings = listings.filter(lst => {
    const matchesCrop = lst.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lst.farmerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = lst.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesPrice = priceMax ? lst.askingPrice <= parseFloat(priceMax) : true;
    
    return matchesCrop && matchesLocation && matchesPrice;
  });

  // NEW: Generate consistent AI Trust Score based on farmer's name for Hackathon MVP
  const generateTrustScore = (farmerName) => {
    if (!farmerName) return { overall: 92, delivery: 94, quality: 89, satisfaction: 4.6, history: 12 };
    let hash = 0;
    for (let i = 0; i < farmerName.length; i++) {
      hash = farmerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const scoreBase = Math.abs(hash % 15); // 0 to 14
    return {
      overall: 85 + scoreBase, // 85 to 99
      delivery: 88 + Math.abs((hash * 2) % 12), // 88 to 99
      quality: 85 + Math.abs((hash * 3) % 14), // 85 to 98
      satisfaction: ((85 + scoreBase) / 20).toFixed(1), // 4.2 to 4.9
      history: 5 + Math.abs(hash % 40) // 5 to 44
    };
  };



  const getRealDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) * 1.3); // Multiply by 1.3 to estimate actual road distance
  };

  const calculateLogistics = (listingItem) => {
    const sellerLoc = listingItem?.location;
    if (!sellerLoc || !user?.location) return { distance: 120, cost: 4800 };
    
    const sLoc = sellerLoc.toLowerCase().trim();
    const uLoc = user.location.toLowerCase().trim();
    
    // Partial string match for local cities (e.g. "Bhopal MP" and "Bhopal")
    if (sLoc === uLoc || sLoc.includes(uLoc) || uLoc.includes(sLoc)) {
      return { distance: 15, cost: 600 }; // Local transport
    }
    
    let dist = 0;
    // Check if backend provided coordinates
    if (listingItem.lat && listingItem.lon && user.lat && user.lon) {
      dist = getRealDistance(listingItem.lat, listingItem.lon, user.lat, user.lon);
    } else {
      // Fallback: If no coords, use a standard estimate instead of random hash to avoid crazy numbers
      dist = 250;
    }

    return { distance: dist, cost: dist * 40 }; // ₹40 per km
  };

  const handleStartBargain = async (listing) => {
    // Close modal if open
    setSelectedListing(null);
    
    // Find if chat already exists
    const existingChat = activeChats.find(c => c.listingId === listing._id && c.buyerId === user._id);
    
    if (existingChat) {
      onOpenChat(existingChat);
    } else {
      try {
        const newChatData = {
          buyerId: user._id,
          buyerName: user.name,
          farmerId: listing.farmerId,
          farmerName: listing.farmerName,
          listingId: listing._id,
          crop: listing.crop,
          askingPrice: listing.askingPrice,
          mandiPrice: listing.askingPrice - 50,
          initialMessage: {
            sender: 'buyer',
            text: `Ram Ram ${listing.farmerName} ji! Main aapka ${listing.crop} dekh raha tha. Quality kaisa hai?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        };
        const openedChat = await openOrCreateChat(newChatData);
        onOpenChat(openedChat);
      } catch (err) {
        console.error('Failed to open chat', err);
      }
    }
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onAddTransaction({
        id: Date.now(),
        farmerId: paymentListing.farmerId,
        buyerId: user._id,
        crop: paymentListing.crop,
        amount: paymentListing.askingPrice * paymentListing.quantity,
        date: new Date().toLocaleDateString(),
        method: paymentMethod
      });
      alert(`Payment Successful via ${paymentMethod}! Farmer has been notified.`);
      setPaymentListing(null);
      setSelectedListing(null);
    }, 1500);
  };

  return (
    <div style={styles.container} className="animate-fade">
      
      {/* Search & Filter Panel */}
      <div style={styles.searchBarCard} className="glass-panel">
        <h3 style={styles.sectionTitle}>
          <Search size={18} style={{ marginRight: '6px' }} color="var(--primary)" />
          {t('search_marketplace')}
        </h3>
        
        <div style={styles.filterGrid}>
          {/* Crop/Farmer Search */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>{t('search_crop')}</label>
            <div style={styles.inputWrapper}>
              <Search size={16} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="e.g. Wheat, Rice, Ramesh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.filterInput}
              />
            </div>
          </div>

          {/* Location Search */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>{t('filter_location')}</label>
            <div style={styles.inputWrapper}>
              <MapPin size={16} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="e.g. Bhopal, Sehore..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={styles.filterInput}
              />
            </div>
          </div>

          {/* Price Range */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>{t('max_price')}</label>
            <div style={styles.inputWrapper}>
              <DollarSign size={16} style={styles.inputIcon} />
              <input
                type="number"
                placeholder="e.g. 2500"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                style={styles.filterInput}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Listings Display */}
      <div style={styles.listingSection}>
        <div style={styles.sectionHeader} className="mobile-col">
          <h3 style={styles.sectionTitle}>
            {t('available_listings')} ({filteredListings.length})
          </h3>
          <span style={styles.resultsBadge} className="badge badge-primary">
            {t('live_feed')}
          </span>
        </div>

        {filteredListings.length === 0 ? (
          <div style={styles.emptyCard} className="glass-panel">
            <Filter size={32} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h4>No listings match your search filters</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Try entering different crops or clearing filters.
            </p>
          </div>
        ) : (
          <div style={styles.listingsGrid}>
            {filteredListings.map(listing => (
              <div key={listing.id} style={styles.listingCard} className="glass-panel">
                
                {/* Product Photo Thumbnail */}
                {listing.photoUrl && (
                  <div style={{ width: '100%', height: '140px', overflow: 'hidden', borderRadius: '12px 12px 0 0', marginBottom: '12px', background: 'rgba(0,0,0,0.2)' }}>
                    <img src={listing.photoUrl} alt={listing.crop} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                {/* Header */}
                <div style={styles.cardTop}>
                  <div>
                    <span className="badge badge-accent" style={{ marginBottom: '0.25rem', background: '#f59e0b', color: '#111827', border: 'none', fontWeight: 'bold' }}>
                      {listing.grade}
                    </span>
                    <h4 style={styles.cropTitle}>{listing.crop}</h4>
                  </div>
                  <div style={styles.priceTag}>
                    ₹{listing.askingPrice} <span style={styles.pricePer}>/q</span>
                  </div>
                </div>

                {/* Details Body */}
                <div style={styles.cardDetails}>
                  <div style={styles.detailRow}>
                    <User size={14} color="var(--primary-light)" />
                    <span>Farmer: <strong>{listing.farmerName}</strong></span>
                  </div>
                  <div style={styles.detailRow}>
                    <MapPin size={14} color="var(--primary-light)" />
                    <span>Location: <strong>{listing.location}</strong></span>
                  </div>
                  <div style={{ ...styles.detailRow, color: '#d97706', marginTop: '4px', background: 'rgba(251, 191, 36, 0.1)', padding: '6px', borderRadius: '6px' }}>
                    <Truck size={14} color="#d97706" />
                    <span>Logistics Est: <strong>{calculateLogistics(listing).distance} km</strong> (₹{calculateLogistics(listing).cost})</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={styles.cardFooter}>
                  <button
                    onClick={() => setSelectedListing(listing)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.6rem' }}
                  >
                    <Eye size={16} />
                    Explore Product
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History for Buyer (NEW) */}
      <div style={{...styles.listingSection, marginTop: '2rem'}}>
        <div style={styles.sectionHeader} className="mobile-col">
          <h3 style={styles.sectionTitle}>
            <CheckCircle size={18} style={{ marginRight: '6px' }} color="#10b981" />
            My Order History
          </h3>
        </div>
        
        {(!transactions || transactions.filter(t => t.buyerId === user._id).length === 0) ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No orders placed yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {transactions.filter(t => t.buyerId === user._id).map(tx => (
              <div key={tx.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #10b981', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>Bought {tx.crop}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    From Farmer ID: {tx.farmerId.substring(0, 6)}...
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>₹{tx.amount}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tx.date} • {tx.method}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EXPLORE MODAL (Detailed Farmer/Product Interface) */}
      {selectedListing && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="glass-panel animate-fade">
            
            <button 
              onClick={() => {
                if (showMap) setShowMap(false);
                else setSelectedListing(null);
              }} 
              style={styles.closeBtn}
            >
              <X size={20} color="#fff" />
            </button>
            
            {/* Modal Image Area */}
            <div style={styles.modalImageContainer}>
              {selectedListing.photoUrl ? (
                <img 
                  src={selectedListing.photoUrl} 
                  alt={selectedListing.crop} 
                  style={styles.modalImage} 
                />
              ) : (
                <div style={styles.imagePlaceholder}>
                  <ImageIcon size={48} color="rgba(255,255,255,0.2)" />
                  <span>No image uploaded</span>
                </div>
              )}
              <div style={styles.imageOverlayGradient}></div>
              <div style={styles.modalHeaderInfo}>
                <span className="badge badge-accent" style={{ background: '#f59e0b', color: '#111827', border: 'none', fontWeight: 'bold' }}>{selectedListing.grade}</span>
                <h2 style={styles.modalCropTitle}>{selectedListing.crop}</h2>
                <h3 style={styles.modalPriceTitle}>₹{selectedListing.askingPrice} / Quintal</h3>
              </div>
            </div>
            
            {/* Modal Details Area */}
            <div style={styles.modalBody}>
              {showMap ? (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    Live GPS Logistics Tracking
                  </h4>
                  <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    {/* Simulated Map Background */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    
                    <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <MapPin size={24} color="#f87171" />
                          <div style={{ fontSize: '0.8rem', color: '#fff', marginTop: '4px' }}>Seller ({selectedListing.location})</div>
                        </div>
                        <div style={{ flex: 1, borderBottom: '2px dashed #10b981', position: 'relative', margin: '0 1rem' }}>
                          <Truck size={24} color="#10b981" style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', padding: '2px', animation: 'drive 3s linear infinite' }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <User size={24} color="#60a5fa" />
                          <div style={{ fontSize: '0.8rem', color: '#fff', marginTop: '4px' }}>You (Buyer)</div>
                        </div>
                      </div>
                      
                      <div style={{ background: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Estimated Distance:</span>
                          <strong style={{ color: '#fff' }}>{calculateLogistics(selectedListing).distance} km</strong>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Est. Cost:</span>
                          <strong style={{ color: '#fbbf24' }}>₹{calculateLogistics(selectedListing).cost}</strong>
                        </div>
                      </div>
                      
                      <button onClick={() => setShowMap(false)} className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem' }}>
                        Back to Details
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    Farmer & Listing Details
                  </h4>
                  
                  <div style={styles.modalGrid}>
                    {/* Left Col: Farmer info */}
                    <div style={styles.modalInfoGroup}>
                      <div style={styles.detailRowLarge}>
                        <User size={18} color="var(--primary-light)" />
                        <div>
                          <div style={styles.labelSmall}>Farmer Name</div>
                          <div style={styles.valLarge}>{selectedListing.farmerName}</div>
                        </div>
                      </div>
                      
                      <div style={styles.detailRowLarge}>
                        <MapPin size={18} color="var(--primary-light)" />
                        <div>
                          <div style={styles.labelSmall}>Origin Location</div>
                          <div style={styles.valLarge}>{selectedListing.location}</div>
                        </div>
                      </div>
                      
                      <div style={styles.detailRowLarge}>
                        <Phone size={18} color="var(--primary-light)" />
                        <div>
                          <div style={styles.labelSmall}>Contact Number</div>
                          <div style={styles.valLarge}>{selectedListing.contact}</div>
                        </div>
                      </div>
                    </div>

                    {/* Right Col: Crop Specs */}
                    <div style={styles.modalInfoGroup}>
                      <div style={styles.detailRowLarge}>
                        <DollarSign size={18} color="var(--accent)" />
                        <div>
                          <div style={styles.labelSmall}>Available Quantity</div>
                          <div style={styles.valLarge}>{selectedListing.quantity} Quintals</div>
                        </div>
                      </div>
                      
                      <div style={styles.detailRowLarge}>
                        <Truck size={18} color={selectedListing.shareTruckPool ? 'var(--primary-light)' : 'var(--text-muted)'} />
                        <div>
                          <div style={styles.labelSmall}>Logistics Support</div>
                          <div style={styles.valLarge}>
                            {selectedListing.shareTruckPool ? 'Truck Pool Sharing Available' : 'No Truck Pooling'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Live Tracking Button */}
                      <button 
                        onClick={() => setShowMap(true)}
                        style={{ marginTop: '1rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', fontWeight: 'bold', width: '100%' }}
                      >
                        <MapIcon size={18} />
                        View Live Tracking Map
                      </button>
                    </div>
                  </div>

                  {/* AI Trust Profile (NEW HACKATHON FEATURE) */}
                  {selectedListing.farmerName && (
                    <div style={{ marginTop: '1.5rem', background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                        <CheckCircle size={20} color="#10b981" />
                        <h4 style={{ fontFamily: 'var(--font-heading)', color: '#fff', margin: 0 }}>AI Trust & Reliability Score</h4>
                        <span className="badge badge-primary" style={{ marginLeft: 'auto', background: '#10b981', color: '#ffffff', fontWeight: 'bold' }}>{generateTrustScore(selectedListing.farmerName).overall}% Trust Match</span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{generateTrustScore(selectedListing.farmerName).delivery}%</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Delivery Reliability</div>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>{generateTrustScore(selectedListing.farmerName).quality}%</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Quality Consistency</div>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fbbf24' }}>{generateTrustScore(selectedListing.farmerName).history} Orders</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Fulfillment History</div>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f87171' }}>{generateTrustScore(selectedListing.farmerName).satisfaction}/5.0</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Buyer Satisfaction</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleStartBargain(selectedListing)}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.85rem', fontSize: '1rem' }}
                    >
                      <MessageSquare size={18} />
                      Chat with Farmer
                    </button>
                    <button
                      onClick={() => setPaymentListing(selectedListing)}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '0.85rem', fontSize: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                      <CreditCard size={18} />
                      Pay & Buy Now
                    </button>
                  </div>
                </>
              )}
              
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {paymentListing && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, maxWidth: '450px', padding: '2rem', textAlign: 'center'}} className="glass-panel animate-fade">
            <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '1rem' }}>Secure Checkout</h2>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(16,185,129,0.3)' }}>
              <h3 style={{ margin: 0, color: '#10b981' }}>Total Amount: ₹{paymentListing.askingPrice * paymentListing.quantity}</h3>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>For {paymentListing.quantity} Quintals of {paymentListing.crop}</p>
            </div>
            
            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <label style={styles.label}>Select Payment Method</label>
              <select 
                className="form-select" 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginTop: '0.5rem' }}
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Credit/Debit Card">Credit/Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash on Delivery (Advance 10%)">Cash on Delivery</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setPaymentListing(null)} className="btn btn-secondary" style={{ flex: 1 }} disabled={isProcessing}>
                Cancel
              </button>
              <button onClick={handlePayment} className="btn btn-primary" style={{ flex: 1, background: '#10b981' }} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}

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
  searchBarCard: {
    padding: '1.5rem',
    textAlign: 'left'
  },
  sectionTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.15rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center'
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  label: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '500'
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
  filterInput: {
    width: '100%',
    padding: '0.65rem 0.65rem 0.65rem 2.25rem',
    background: 'rgba(10, 15, 13, 0.6)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: '#fff',
    outline: 'none'
  },
  listingSection: {
    textAlign: 'left'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  resultsBadge: {
    fontSize: '0.7rem'
  },
  listingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem'
  },
  listingCard: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    border: '1px solid rgba(16, 185, 129, 0.12)',
    transition: 'all 0.3s ease'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.75rem'
  },
  cropTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.15rem',
    fontWeight: '600',
    color: '#fff'
  },
  priceTag: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--accent)'
  },
  pricePer: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: 'normal'
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  cardFooter: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: 'auto'
  },
  emptyCard: {
    padding: '3rem',
    textAlign: 'center',
    color: 'var(--text-secondary)'
  },
  
  /* EXPLORE MODAL STYLES */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '2rem'
  },
  modalContent: {
    position: 'relative',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-secondary)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
  },
  closeBtn: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    zIndex: 10,
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer'
  },
  modalImageContainer: {
    position: 'relative',
    width: '100%',
    height: '300px',
    backgroundColor: '#000'
  },
  modalImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'rgba(255,255,255,0.4)',
    gap: '0.5rem',
    background: 'var(--bg-tertiary)'
  },
  imageOverlayGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '150px',
    background: 'linear-gradient(to top, var(--bg-secondary) 0%, transparent 100%)'
  },
  modalHeaderInfo: {
    position: 'absolute',
    bottom: '20px',
    left: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.4rem',
    textAlign: 'left'
  },
  modalCropTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
  },
  modalPriceTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.4rem',
    fontWeight: '600',
    color: 'var(--accent)',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
  },
  modalBody: {
    padding: '24px',
    textAlign: 'left'
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem'
  },
  modalInfoGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  detailRowLarge: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem'
  },
  labelSmall: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.2rem'
  },
  valLarge: {
    fontSize: '0.95rem',
    color: '#fff',
    fontWeight: '500'
  }
};
