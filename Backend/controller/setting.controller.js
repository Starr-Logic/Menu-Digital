import { Setting } from '../models/index.js';

export const getSettings = async (req, res) => {
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
};

export const updateSettings = async (req, res) => {
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
};
