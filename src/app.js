require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const healthRoutes = require('./routes/health.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
