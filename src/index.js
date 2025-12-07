const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const transactionRoutes = require('./routes/transactionRoutes'); // Import Routes

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mount Routes
app.use('/api/transactions', transactionRoutes); // <--- THIS IS NEW

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});