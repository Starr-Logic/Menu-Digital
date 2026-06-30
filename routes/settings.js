import express from 'express';
import { Setting } from '../models/index.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// GET /api/settings : Fetch store settings
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings : Update store settings
router.put('/', verifyToken, async (req, res) => {
  try {
    const {
      storeName,
      storePhone,
      storeEmail,
      storeLocation,
      businessHours,
      deliveryZone,
      minOrderValue,
      currency,
    } = req.body;

    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        storeName,
        storePhone,
        storeEmail,
        storeLocation,
        businessHours,
        deliveryZone,
        minOrderValue,
        currency,
      });
    } else {
      await settings.update({
        storeName,
        storePhone,
        storeEmail,
        storeLocation,
        businessHours,
        deliveryZone,
        minOrderValue,
        currency,
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
