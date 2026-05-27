// Mock Data for KisanConnect Smart Farmer-to-Market Platform

export const INITIAL_LISTINGS = [
  {
    id: "lst-1",
    farmerId: "usr-farmer-1",
    farmerName: "Kisan Ramesh Kumar",
    crop: "Wheat (Kanak)",
    quantity: 12, // in Quintals
    askingPrice: 2100, // per Quintal
    location: "Bhopal, MP",
    contact: "+91 98765 43210",
    grade: "Grade A Premium",
    listedDate: "2026-05-24",
    shareTruckPool: true,
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "lst-2",
    farmerId: "usr-farmer-2",
    farmerName: "Kisan Rajesh Patel",
    crop: "Rice (Basmati)",
    quantity: 25,
    askingPrice: 3800,
    location: "Sehore, MP",
    contact: "+91 99887 76655",
    grade: "Grade A Super",
    listedDate: "2026-05-25",
    shareTruckPool: true,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "lst-3",
    farmerId: "usr-farmer-3",
    farmerName: "Kisan Satish Verma",
    crop: "Wheat (Sarbati)",
    quantity: 8,
    askingPrice: 2300,
    location: "Vidisha, MP",
    contact: "+91 91234 56789",
    grade: "Grade A+",
    listedDate: "2026-05-26",
    shareTruckPool: false,
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "lst-4",
    farmerId: "usr-farmer-4",
    farmerName: "Kisan Surendra Singh",
    crop: "Cotton",
    quantity: 40,
    askingPrice: 6200,
    location: "Hoshangabad, MP",
    contact: "+91 88776 65544",
    grade: "Grade B Standard",
    listedDate: "2026-05-23",
    shareTruckPool: true,
    imageUrl: "https://images.unsplash.com/photo-1596728362621-eecdf12e02e1?auto=format&fit=crop&q=80&w=800"
  }
];

export const MANDI_RATES = {
  "Wheat (Kanak)": { current: 2050, trend: "up", predictedNextWeek: 2200, lastUpdated: "2026-05-26" },
  "Wheat (Sarbati)": { current: 2250, trend: "up", predictedNextWeek: 2380, lastUpdated: "2026-05-26" },
  "Rice (Basmati)": { current: 3750, trend: "down", predictedNextWeek: 3700, lastUpdated: "2026-05-26" },
  "Cotton": { current: 6100, trend: "up", predictedNextWeek: 6350, lastUpdated: "2026-05-26" },
  "Onion": { current: 1400, trend: "stable", predictedNextWeek: 1400, lastUpdated: "2026-05-26" },
  "Tomato": { current: 1800, trend: "up", predictedNextWeek: 2100, lastUpdated: "2026-05-26" }
};

export const INITIAL_CHATS = [
  {
    id: "chat-1",
    buyerId: "usr-buyer-1",
    buyerName: "AgroCorp Retailers",
    farmerId: "usr-farmer-1",
    farmerName: "Kisan Ramesh Kumar",
    listingId: "lst-1",
    crop: "Wheat (Kanak)",
    messages: [
      { sender: "buyer", text: "Ram Ram Ramesh ji, aapka Kanak gehun ka ad dekhna. Quality kaisa hai?", timestamp: "18:30" },
      { sender: "farmer", text: "Ram Ram bhaiya! Gehun bilkul Grade A hai, ekdum saaf aur sunehra hai. Mandi rate se accha milega.", timestamp: "18:32" },
      { sender: "buyer", text: "Aapne ₹2100 per quintal rakha hai. Mandi me abhi ₹2050 chal raha hai. Thoda kam ho sakta hai?", timestamp: "18:33" }
    ],
    mandiPrice: 2050,
    askingPrice: 2100
  }
];
