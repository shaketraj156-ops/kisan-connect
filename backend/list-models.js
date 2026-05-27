const fetch = require('node-fetch');
async function run() {
  const apiKey = "AIzaSyD61DvbDA6HPdS4fiQAPXEoZ7-gf6mAn0w";
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);
}
run();
