require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
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

const DB_FILE = path.join(__dirname, 'database.json');

// Helper to read DB
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], listings: [], chats: [] };
  }
};

// Helper to write DB
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Generate random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

console.log('✅ Connected to Local File Database (Hostel WiFi Safe!)');

// ================= API ROUTES =================

// 1. Auth/Login Route
app.post('/api/login', (req, res) => {
  try {
    const { name, phone, location, role } = req.body;
    const db = readDB();
    
    let user = db.users.find(u => u.phone === phone && u.role === role);
    
    if (!user) {
      user = { _id: generateId(), name, phone, location, role };
      db.users.push(user);
      writeDB(db);
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get All Listings
app.get('/api/listings', (req, res) => {
  try {
    const db = readDB();
    // Reverse array to show newest first
    res.status(200).json([...db.listings].reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Create New Listing
app.post('/api/listings', (req, res) => {
  try {
    const db = readDB();
    const newListing = { _id: generateId(), ...req.body, createdAt: new Date() };
    db.listings.push(newListing);
    writeDB(db);
    res.status(201).json(newListing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Delete Listing
app.delete('/api/listings/:id', (req, res) => {
  try {
    const db = readDB();
    const { id } = req.params;
    const initialLength = db.listings.length;
    db.listings = db.listings.filter(l => l._id !== id);
    if (db.listings.length === initialLength) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    writeDB(db);
    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get Chats for a specific user
app.get('/api/chats/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const db = readDB();
    const chats = db.chats.filter(c => c.buyerId === userId || c.farmerId === userId).reverse();
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Create or Get Chat
app.post('/api/chats', (req, res) => {
  try {
    const db = readDB();
    const { buyerId, buyerName, farmerId, farmerName, listingId, crop, askingPrice, mandiPrice, initialMessage } = req.body;
    
    let chat = db.chats.find(c => c.buyerId === buyerId && c.farmerId === farmerId && c.listingId === listingId);
    
    if (!chat) {
      chat = {
        _id: generateId(),
        buyerId, buyerName, farmerId, farmerName, listingId, crop, askingPrice, mandiPrice,
        messages: [initialMessage]
      };
      db.chats.push(chat);
      writeDB(db);
    }
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Add Message to Chat
app.post('/api/chats/:chatId/message', (req, res) => {
  try {
    const { chatId } = req.params;
    const { sender, text, timestamp } = req.body;
    const db = readDB();
    
    const chatIndex = db.chats.findIndex(c => c._id === chatId);
    if (chatIndex === -1) return res.status(404).json({ error: 'Chat not found' });
    
    db.chats[chatIndex].messages.push({ sender, text, timestamp });
    writeDB(db);
    
    res.status(200).json(db.chats[chatIndex]);
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
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
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
