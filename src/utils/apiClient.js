// API Client for interacting with the Express Backend

export const loginUser = async (userData) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

export const fetchListings = async () => {
  const response = await fetch('/api/listings');
  if (!response.ok) throw new Error('Failed to fetch listings');
  return response.json();
};

export const createListing = async (listingData) => {
  const response = await fetch('/api/listings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listingData)
  });
  if (!response.ok) throw new Error('Failed to create listing');
  return response.json();
};

export const deleteListing = async (id) => {
  const response = await fetch(`/api/listings/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete listing');
  return response.json();
};

export const fetchChats = async (userId) => {
  const response = await fetch(`/api/chats/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch chats');
  return response.json();
};

export const openOrCreateChat = async (chatData) => {
  const response = await fetch('/api/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chatData)
  });
  if (!response.ok) throw new Error('Failed to open chat');
  return response.json();
};

export const sendMessage = async (chatId, messageData) => {
  const response = await fetch(`/api/chats/${chatId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageData)
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};
