const axios = require('axios');
const fs = require('fs');
const path = require('path');

const testUpload = async () => {
  try {
    const API_URL = 'https://kisan-connect-lzul.onrender.com/api/listings';
    
    // Create a dummy 5MB payload
    const dummyBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(5 * 1024 * 1024);
    
    const newListing = {
      farmerId: "test",
      farmerName: "Test Farmer",
      crop: "Test Crop",
      quantity: 10,
      askingPrice: 2000,
      location: "Test Location",
      contact: "1234567890",
      grade: "Grade A",
      shareTruckPool: false,
      photoUrl: dummyBase64
    };

    console.log("Sending 5MB payload to Render...");
    const res = await axios.post(API_URL, newListing);
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
};

testUpload();
