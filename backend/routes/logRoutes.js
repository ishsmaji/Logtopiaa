const express = require("express");
const { getLogs, exportLogs, getStats, createLog } = require("../controllers/logController");

const router = express.Router();
const logRoutes = function(io) {

  router.post('/createLog', (req, res) => createLog(req, res, io));
  router.get('/logs', (req, res) => getLogs(req, res, io));
  router.get('/logs/export', exportLogs);
  router.get('/stats', getStats);

  return router;
};

module.exports = logRoutes;

/**
 * @swagger
 * components:
 *   schemas:
 *     Log:
 *       type: object
 *       required:
 *         - level
 *         - source
 *         - message
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the log was created (defaults to current time if not provided)
 *         level:
 *           type: string
 *           enum: [info, warning, error]
 *           description: The log level
 *         source:
 *           type: string
 *           description: The source system that generated the log
 *         message:
 *           type: string
 *           description: The log message
 *         details:
 *           type: object
 *           properties:
 *             stack:
 *               type: string
 *               description: The error stack trace (if available)
 *             metadata:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: ID of the user associated with this log
 *                 requestId:
 *                   type: string
 *                   description: ID of the request that generated this log
 *     Alert:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [error_frequency, error_threshold]
 *           description: The type of alert
 *         message:
 *           type: string
 *           description: Alert description
 *         log:
 *           $ref: '#/components/schemas/Log'
 *     LogStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of logs
 *         byLevel:
 *           type: object
 *           properties:
 *             error:
 *               type: integer
 *               description: Number of error logs
 *             warning:
 *               type: integer
 *               description: Number of warning logs
 *             info:
 *               type: integer
 *               description: Number of info logs
 *         bySources:
 *           type: object
 *           description: Log counts grouped by source
 */

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Log management API
 */

/**
 * @swagger
 * /createLog:
 *   post:
 *     summary: Create a new log entry
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Log'
 *           example:
 *             level: "error"
 *             source: "payment-service"
 *             message: "Failed to process payment"
 *             details:
 *               stack: "Error: Payment gateway timeout\n    at processPayment (/app/services/payment.js:45:12)"
 *               metadata:
 *                 userId: "user123"
 *                 requestId: "req456"
 *     responses:
 *       200:
 *         description: Log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Log'
 *                 message:
 *                   type: string
 *                   example: "Log created successfully"
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "Level, source, and message are required fields"
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Retrieve logs with optional filtering
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs before this date
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warning, error, all]
 *         description: Filter by log level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in message and source fields
 *     responses:
 *       200:
 *         description: A list of logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Log'
 *                 message:
 *                   type: string
 *                   example: "Logs fetched successfully"
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /logs/export:
 *   get:
 *     summary: Export logs in CSV or JSON format
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs before this date
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warning, error, all]
 *         description: Filter by log level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in message and source fields
 *     responses:
 *       200:
 *         description: Exported logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Log'
 *                 message:
 *                   type: string
 *                   example: "Logs exported successfully"
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *               example: "Timestamp,Level,Source,Message\n2025-03-10T14:48:00.000Z,error,payment-service,\"Failed to process payment\""
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get log statistics
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Log statistics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LogStats'
 *                 message:
 *                   type: string
 *                   example: "Log statistics fetched successfully"
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * security:
 *   - bearerAuth: []
 */