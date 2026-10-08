import express from "express";

import dataSource from "../config/data-source.js";

const router = express.Router();

router.get('/health', async (req, res) => {
  let database = 'disconnected';

  if (dataSource.isInitialized) {
    try {
      await dataSource.query('SELECT 1');
      database = 'connected';
    } catch (err) {
      database = 'disconnected';
    }
  }

  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    database,
    timestamp: new Date().toISOString(),
  });
});

export default router;
