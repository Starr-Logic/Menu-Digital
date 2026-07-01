import express from 'express';
import { verifyToken } from '../guards/auth.guard.js';
import { getOrders, getTableOrders, createOrder, updateOrderStatus } from '../controller/order.controller.js';

const router = express.Router();

// GET /api/orders
router.get('/', verifyToken, getOrders);

// GET /api/orders/table/:tableName
router.get('/table/:tableName', getTableOrders);

// POST /api/orders
router.post('/', createOrder);

// PATCH /api/orders/:id/status
router.patch('/:id/status', verifyToken, updateOrderStatus);

export default router;
