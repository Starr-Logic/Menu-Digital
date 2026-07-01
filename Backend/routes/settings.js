import express from 'express';
import { verifyToken } from '../guards/auth.guard.js';
import { getSettings, updateSettings } from '../controller/setting.controller.js';

const router = express.Router();

// GET /api/settings
router.get('/', getSettings);

// PUT /api/settings
router.put('/', verifyToken, updateSettings);

export default router;
