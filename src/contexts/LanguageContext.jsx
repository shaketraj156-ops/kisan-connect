import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    "welcome": "Welcome to KisanConnect",
    "login_farmer": "I am a Farmer / Seller",
    "login_buyer": "I am a Buyer / Merchant",
    "enter_name": "Enter your full name",
    "enter_phone": "Enter 10-digit mobile number",
    "enter_location": "Enter your City or Village",
    "login_btn": "Start Trading",
    "logout": "Log Out",
    "search_placeholder": "e.g. Wheat, Rice, Ramesh...",
    "live_feed": "Live Feed",
    "chat_farmer": "Chat with Farmer",
    "upload_crop": "Upload New Crop Details",
    "crop_name": "Crop Name",
    "quantity": "Quantity (Quintals)",
    "price": "Asking Price (₹ per Quintal)",
    "list_crop": "List Crop on Market",
    "my_listings": "My Listed Products",
    "negotiation_chats": "Negotiation Chats (Buyer Bargaining)",
    "join_network": "Join India's smartest agricultural trade network",
    "select_role": "Select Your Role",
    "farmer_seller": "Farmer (Seller)",
    "buyer_merchant": "Buyer / Merchant",
    "full_name": "Full Name / Business Name",
    "mobile_number": "Mobile Number",
    "location": "Location (City / State)",
    "connecting": "Connecting...",
    "why_connect": "Why KisanConnect?",
    "search_marketplace": "Search & Filter Marketplace",
    "search_crop": "Enter Crop or Farmer Name",
    "filter_location": "Filter Location",
    "max_price": "Max Price (₹/Quintal)",
    "available_listings": "Available Farmer Listings"
  },
  hi: {
    "welcome": "KisanConnect mein aapka swagat hai",
    "login_farmer": "Main ek Kisan / Seller hu",
    "login_buyer": "Main ek Khareedar / Merchant hu",
    "enter_name": "Apna poora naam darj karein",
    "enter_phone": "10-digit mobile number dalein",
    "enter_location": "Apna Shahar ya Gaon dalein",
    "login_btn": "Vyapaar Shuru Karein",
    "logout": "Log Out Karein",
    "search_placeholder": "jaise Gehun, Chawal, Ramesh...",
    "live_feed": "Live Updates",
    "chat_farmer": "Kisan Se Baat Karein",
    "upload_crop": "Nayi Fasal Ki Jankari Dalein",
    "crop_name": "Fasal Ka Naam",
    "quantity": "Matra (Quintal mein)",
    "price": "Daam (₹ prati Quintal)",
    "list_crop": "Mandi Mein Fasal Dalein",
    "my_listings": "Meri Dali Gayi Faslein",
    "negotiation_chats": "Bhaav-Taav Chats",
    "join_network": "India ke sabse smart krishi network se judein",
    "select_role": "Apni Bhumika Chunein",
    "farmer_seller": "Kisan (Seller)",
    "buyer_merchant": "Khareedar / Vyapari",
    "full_name": "Poora Naam / Business Name",
    "mobile_number": "Mobile Number",
    "location": "Location (Shahar / Rajya)",
    "connecting": "Jud raha hai...",
    "why_connect": "KisanConnect kyu chunein?",
    "search_marketplace": "Mandi Khojein aur Filter Karein",
    "search_crop": "Fasal ya Kisan ka naam likhein",
    "filter_location": "Location filter karein",
    "max_price": "Adhiktam Daam (₹/Quintal)",
    "available_listings": "Uplabdh Kisano ki Faslein"
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = (key) => {
    return translations[lang][key] || key;
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'hi' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
