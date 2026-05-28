const mongoose = require('mongoose');
const uri = "mongodb+srv://shaketraj156_db_user:zbXYGEAfrBNAPwY5@cluster0.wtn6zqr.mongodb.net/kisanconnect?retryWrites=true&w=majority";

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("SUCCESS");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAIL:", err.message);
    process.exit(1);
  });
