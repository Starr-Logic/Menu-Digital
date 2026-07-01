import express from 'express';
import { verifyToken } from '../guards/auth.guard.js';
import { register, login, verify } from '../controller/auth.controller.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/verify
router.get('/verify', verifyToken, verify);

export default router;
