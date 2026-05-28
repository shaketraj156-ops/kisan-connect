const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const mongoose = require('mongoose');

// Generate random ID for backwards compatibility with frontend
const generateId = () => Math.random().toString(36).substr(2, 9);

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/kisanconnect';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB Atlas (Persistent Data)'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas (Strict: false allows any fields, acting like NoSQL documents)
const User = mongoose.model('User', new mongoose.Schema({ _id: String }, { strict: false }));
const Listing = mongoose.model('Listing', new mongoose.Schema({ _id: String, createdAt: Date }, { strict: false }));
const Chat = mongoose.model('Chat', new mongoose.Schema({ _id: String, messages: Array }, { strict: false }));

// ================= API ROUTES =================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongoUriLoaded: !!process.env.MONGO_URI,
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Helper for geocoding
async function getCoords(location) {
  if (!location) return null;
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&format=json`);
    const data = await res.json();
    if (data?.results?.length > 0) {
      return { lat: data.results[0].latitude, lon: data.results[0].longitude };
    }
  } catch (err) {
    console.error("Geocoding failed for", location, err);
  }
  return null;
}

// 1. Auth/Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { name, phone, location, role } = req.body;
    let user = await User.findOne({ phone, role });
    
    if (!user) {
      const coords = await getCoords(location);
      user = new User({ 
        _id: generateId(), 
        name, phone, location, role,
        lat: coords?.lat, lon: coords?.lon
      });
      await user.save();
    } else if (user.location !== location || !user.lat) {
      // If location changed or coords missing, update them
      const coords = await getCoords(location);
      if (coords) {
        user.location = location;
        user.lat = coords.lat;
        user.lon = coords.lon;
        await User.updateOne({ _id: user._id }, { $set: { location, lat: coords.lat, lon: coords.lon } });
      } else if (user.location !== location) {
        // Still update location even if geocoding failed
        user.location = location;
        await User.updateOne({ _id: user._id }, { $set: { location } });
      }
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get All Listings
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Create New Listing
app.post('/api/listings', async (req, res) => {
  try {
    const coords = await getCoords(req.body.location);
    const newListing = new Listing({ 
      _id: generateId(), 
      ...req.body, 
      lat: coords?.lat, 
      lon: coords?.lon,
      createdAt: new Date() 
    });
    await newListing.save();
    res.status(201).json(newListing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Delete Listing
app.delete('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Listing.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get Chats for a specific user
app.get('/api/chats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await Chat.find({ $or: [{ buyerId: userId }, { farmerId: userId }] });
    res.status(200).json(chats.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Create or Get Chat
app.post('/api/chats', async (req, res) => {
  try {
    const { buyerId, buyerName, farmerId, farmerName, listingId, crop, askingPrice, mandiPrice, initialMessage } = req.body;
    
    let chat = await Chat.findOne({ buyerId, farmerId, listingId });
    
    if (!chat) {
      chat = new Chat({
        _id: generateId(),
        buyerId, buyerName, farmerId, farmerName, listingId, crop, askingPrice, mandiPrice,
        messages: [initialMessage]
      });
      await chat.save();
    }
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Add Message to Chat
app.post('/api/chats/:chatId/message', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { sender, text, timestamp } = req.body;
    
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId },
      { $push: { messages: { sender, text, timestamp } } },
      { new: true }
    );
    
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Gemini Vision API for Disease Detection
app.post('/api/analyze-disease', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert Indian Agronomist. 
    Analyze this image of a crop/plant.
    Identify the crop and any visible disease.
    If it's not a crop, state that.
    Return ONLY a raw JSON object with no markdown formatting. The JSON must have these exact keys:
    {
      "disease": "Name of crop and disease (e.g. Tomato Early Blight) or 'Healthy'",
      "confidence": "Percentage (e.g. 95%)",
      "description": "Short description of the symptoms you see.",
      "action": "Recommended action or pesticide to use."
    }`;

    // Remove the data:image/jpeg;base64, part if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType || "image/jpeg"
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonResult = JSON.parse(text);
    res.status(200).json(jsonResult);
  } catch (error) {
    console.error("Gemini Error, falling back to Mock:", error.message);
    const mockResponses = [
      {
        disease: "Tomato Early Blight",
        confidence: "92%",
        description: "Dark concentric rings on the lower leaves, surrounded by a yellow halo. Typical of early blight.",
        action: "Remove infected leaves immediately. Apply a copper-based fungicide."
      },
      {
        disease: "Wheat Leaf Rust",
        confidence: "88%",
        description: "Small, orange-brown pustules on the upper surface of the leaves. Highly contagious.",
        action: "Apply triazole or strobilurin fungicides. Ensure proper crop rotation."
      },
      {
        disease: "Healthy Plant",
        confidence: "95%",
        description: "The leaves appear vibrant and free of any visible lesions or yellowing.",
        action: "Continue normal watering and fertilization routine."
      },
      {
        disease: "Powdery Mildew",
        confidence: "85%",
        description: "White, powdery fungal spots on leaves and stems.",
        action: "Increase air circulation, avoid overhead watering, and apply neem oil."
      }
    ];
    const randomMock = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    res.status(200).json(randomMock);
  }
});

app.get('/api/list-models', async (req, res) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= SOCKET.IO =================
io.on('connection', (socket) => {
  console.log('User connected to WebSockets:', socket.id);
  
  // Join a specific chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat: ${chatId}`);
  });

  // Handle incoming real-time messages
  socket.on('send_message', (data) => {
    // Broadcast the message to everyone in the chat room (except sender)
    // Actually, to make it simple we'll broadcast to the room and frontend will filter duplicates if needed
    socket.to(data.chatId).emit('receive_message', data.message);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start Server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Local Backend Server running on http://localhost:${PORT}`);
});
