import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthPortal from './components/AuthPortal';
import SellerDashboard from './components/SellerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import ChatSystem from './components/ChatSystem';
import DiseaseDetector from './components/DiseaseDetector';
import Navbar from './components/Navbar';
import { LanguageProvider } from './contexts/LanguageContext';
import { loginUser, fetchListings, createListing, fetchChats, deleteListing } from './utils/apiClient';

const GOOGLE_CLIENT_ID = '230242167658-kccgd0cc39e97v169q7t7oelpqrh6k9j.apps.googleusercontent.com';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kisanUser');
    return saved ? JSON.parse(saved) : null;
  }); 
  const [listings, setListings] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch initial data when user logs in
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedListings, fetchedChats] = await Promise.all([
        fetchListings(),
        fetchChats(user._id)
      ]);
      setListings(fetchedListings);
      setChats(fetchedChats);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (profile) => {
    setUser(profile);
    localStorage.setItem('kisanUser', JSON.stringify(profile));
  };
  
  const handleLogout = () => { 
    setUser(null); 
    localStorage.removeItem('kisanUser');
    setCurrentChat(null);
    setListings([]);
    setChats([]);
    setTransactions([]);
  };

  const handleAddListing = (newListing) => {
    setListings([newListing, ...listings]);
  };

  const handleDeleteListing = async (id) => {
    try {
      await deleteListing(id);
      setListings(listings.filter(l => (l._id || l.id) !== id));
    } catch (err) {
      console.error('Failed to delete listing:', err);
      // Fallback to local delete for MVP if API fails
      setListings(listings.filter(l => (l._id || l.id) !== id));
    }
  };

  const handleAddTransaction = (newTx) => {
    setTransactions([newTx, ...transactions]);
  };

  const handleUpdateChat = (updatedChat) => {
    setChats(prevChats => {
      const exists = prevChats.some(c => c._id === updatedChat._id);
      if (exists) {
        return prevChats.map(c => c._id === updatedChat._id ? updatedChat : c);
      }
      return [updatedChat, ...prevChats];
    });
    setCurrentChat(updatedChat);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LanguageProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
          <Navbar user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
            {!user ? (
              <AuthPortal onLoginSuccess={handleLogin} />
            ) : loading ? (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'50vh', color:'var(--text-secondary)' }}>
                Loading live data from Database...
              </div>
            ) : (
              <div style={{ position: 'relative', width: '100%', flex: 1 }}>
                {activeTab === 'ai_scanner' ? (
                  <DiseaseDetector />
                ) : user.role === 'farmer' ? (
                  <SellerDashboard 
                    user={user} 
                    listings={listings} 
                    onAddListing={handleAddListing} 
                    onDeleteListing={handleDeleteListing}
                    chats={chats} 
                    onOpenChat={setCurrentChat} 
                    transactions={transactions}
                  />
                ) : (
                  <BuyerDashboard 
                    user={user} 
                    listings={listings} 
                    activeChats={chats} 
                    onOpenChat={setCurrentChat} 
                    onAddTransaction={handleAddTransaction}
                    transactions={transactions}
                  />
                )}
                {currentChat && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ width: '100%', maxWidth: '650px' }}>
                      <ChatSystem 
                        activeChat={currentChat} 
                        user={user} 
                        onUpdateChat={handleUpdateChat} 
                        onClose={() => setCurrentChat(null)} 
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </LanguageProvider>
    </GoogleOAuthProvider>
  );
}
