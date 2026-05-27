const axios = require('axios');

async function testGovApi() {
  const apiKey = '579b464db66ec23bdd000001a44e89e8e38a4537575909cb6d2e957e';
  const resourceId = '9ef84268-d588-465a-a308-a864a43d0070'; // Daily wholesale prices
  
  try {
    const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&offset=0&limit=5`;
    const response = await axios.get(url);
    console.log('Success! Data:', JSON.stringify(response.data.records, null, 2));
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
  }
}

testGovApi();
