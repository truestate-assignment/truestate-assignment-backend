const mongoose = require('mongoose');
const Transaction = require('./src/models/Transaction');
require('dotenv').config();

const reduceData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const count = await Transaction.countDocuments();
        console.log(`Current count: ${count}`);

        if (count > 5000) {
            console.log('Reducing to 5000 records...');
            // Find the IDs of the 5000 most recent records
            const keep = await Transaction.find().sort({ date: -1 }).limit(5000).select('_id');
            const keepIds = keep.map(d => d._id);

            // Delete everything else
            const result = await Transaction.deleteMany({ _id: { $nin: keepIds } });
            console.log(`Deleted ${result.deletedCount} records.`);
        } else {
            console.log('Count is already <= 5000');
        }

        await mongoose.disconnect();
        console.log('Done');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

reduceData();
