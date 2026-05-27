const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
  try {
    const { data } = await axios.get('https://krishijagran.com/commodity-prices/');
    const $ = cheerio.load(data);
    const text = $('body').text();
    if (text.includes('Wheat') || text.includes('Rice')) {
      console.log('Success: Reached Krishi Jagran and found crops');
    } else {
      console.log('Failed to find crop data');
    }
  } catch (err) {
    console.error('Error scraping Krishi Jagran:', err.message);
  }

  try {
    const { data } = await axios.get('https://www.commodityonline.com/mandi-prices/wheat/uttar-pradesh');
    const $ = cheerio.load(data);
    const firstPrice = $('td').text();
    console.log('Success: Reached CommodityOnline');
  } catch (err) {
    console.error('Error scraping CommodityOnline:', err.message);
  }
}

testScrape();
