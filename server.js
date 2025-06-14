require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const logger = require('./utils/logger');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./config/db');

const app = express();

app.use(express.json());
app.use(morgan('combined', { stream: logger.stream }));

app.use('/api/users', userRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    logger.info(`Server running on port ${process.env.PORT}`);
  });
});