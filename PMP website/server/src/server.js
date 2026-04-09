const connectDB = require('./config/db');
const app = require('./app');
const { PORT } = require('./config/env');

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
