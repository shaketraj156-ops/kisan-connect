<div align="center">
  <img src="https://img.icons8.com/fluency/96/tractor.png" alt="FarmSpan Logo" width="80" />
  
  # FarmSpan (formerly KisanConnect) 🌾
  
  **Empowering Indian Farmers through Direct Market Access, AI, & Real-Time Logistics.**
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)
</div>

---

## 📸 Application Screenshots

*(Upload your screenshots here! Name your files `screenshot1.png`, `screenshot2.png` and save them in the root folder of this project!)*

<div align="center">
  <img src="./screenshot1.png" alt="Home Dashboard" width="45%" />
  &nbsp; &nbsp;
  <img src="./screenshot2.png" alt="Marketplace" width="45%" />
</div>

<div align="center">
  <img src="./screenshot3.png" alt="AI Disease Detector" width="45%" />
  &nbsp; &nbsp;
  <img src="./screenshot4.png" alt="Real-time Chat" width="45%" />
</div>

---

## 🚀 The Problem We Are Solving

Indian farmers face immense challenges due to multiple layers of middlemen, resulting in them receiving a fraction of the actual market value of their crops. Furthermore, lack of real-time market data, logistics cost estimation, and crop health awareness keep them locked in a cycle of low profitability.

## 💡 Our Solution: FarmSpan

**FarmSpan** is a unified digital ecosystem that bridges the gap between farmers and direct buyers/businesses. We eliminate middlemen while providing powerful tools like **AI Disease Detection**, **Live Gov. Mandi Rate APIs**, and **Real-time Geo-logistics**.

---

## 🔥 Key Features

1. **Direct B2B/B2C Marketplace** 🛒
   - Farmers list their harvest directly. Buyers browse with live dynamic filters.
   
2. **Advanced Logistics & Distance Engine (Haversine Formula)** 🗺️
   - Powered by the **Open-Meteo Geocoding API**.
   - Calculates the *exact* real-world distance between the buyer and seller's coordinates, instantly generating transparent transport costs.

3. **Live Gov API & AI Price Fallback** 📈
   - Automatically pulls live modal crop prices from **Data.gov.in (AGMARKNET)**.
   - If the government API is down, our **Smart AI Fallback Dictionary** kicks in to provide realistic baseline estimates for all common crops.

4. **Real-time Negotiation Chat** 💬
   - Built on **Socket.io** for instant WebSocket communication.
   - Includes **Smart AI Replies** to help farmers bargain efficiently without typing long sentences.

5. **AI Crop Disease Detector** 🍃
   - Farmers can upload photos of unhealthy crops. The AI analyzes the leaf to identify the disease and immediately suggests remedies.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React.js, Vite, Lucide-React (Icons), Custom Vanilla CSS.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (NoSQL for maximum flexibility).
- **Real-Time Data:** Socket.io (WebSockets).
- **External Integrations:** Google OAuth, Open-Meteo API, India Gov Mandi API.

---

## 🧠 Why FarmSpan Wins

FarmSpan is not just a UI mockup. It is a **fully functional, robust, and scalable architecture**. By offloading heavy tasks like Geocoding to the backend, and utilizing geographical formulas (Haversine) over static approximations, we provide a lightning-fast, production-ready solution tailored specifically for the Indian agricultural landscape.

---

<div align="center">
  Made with ❤️ for Indian Farmers.
</div>
