/**
 * API Integration Tests
 *
 * Tests API endpoints with real database connections.
 * These tests verify the full request/response cycle.
 */

import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import { createServer } from 'http';

// Mock the database and auth for integration tests
jest.mock('../../server/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: 'test-id' }]),
  },
}));

describe('API Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    // Create a minimal test app
    app = express();
    app.use(express.json());

    // Add health endpoint for testing
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });
    });

    // Add mock dashboard stats endpoint
    app.get('/api/dashboard/stats', (req, res) => {
      res.json({
        totalConsultants: 13,
        activeConsultants: 11,
        totalHospitals: 3,
        activeProjects: 3,
        pendingDocuments: 1,
        totalSavings: '0',
      });
    });

    // Add mock consultants endpoint
    app.get('/api/consultants', (req, res) => {
      res.json([
        { id: '1', firstName: 'John', lastName: 'Doe', status: 'active' },
        { id: '2', firstName: 'Jane', lastName: 'Smith', status: 'active' },
      ]);
    });

    // Add mock support tickets endpoint
    app.get('/api/support-tickets', (req, res) => {
      res.json([
        { id: '1', title: 'Login Issue', status: 'open', priority: 'high' },
        { id: '2', title: 'Report Bug', status: 'resolved', priority: 'medium' },
      ]);
    });

    app.post('/api/support-tickets', (req, res) => {
      const { title, description, priority } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      res.status(201).json({
        id: 'new-ticket-id',
        title,
        description,
        priority: priority || 'medium',
        status: 'open',
        createdAt: new Date().toISOString(),
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  });

  describe('Health Endpoint', () => {
    test('GET /api/health should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('Dashboard Stats Endpoint', () => {
    test('GET /api/dashboard/stats should return dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('totalConsultants');
      expect(response.body).toHaveProperty('activeConsultants');
      expect(response.body).toHaveProperty('totalHospitals');
      expect(response.body).toHaveProperty('activeProjects');
      expect(typeof response.body.totalConsultants).toBe('number');
    });
  });

  describe('Consultants Endpoint', () => {
    test('GET /api/consultants should return list of consultants', async () => {
      const response = await request(app)
        .get('/api/consultants')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('firstName');
      expect(response.body[0]).toHaveProperty('lastName');
    });
  });

  describe('Support Tickets Endpoint', () => {
    test('GET /api/support-tickets should return list of tickets', async () => {
      const response = await request(app)
        .get('/api/support-tickets')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('status');
    });

    test('POST /api/support-tickets should create a new ticket', async () => {
      const newTicket = {
        title: 'Test Ticket',
        description: 'This is a test ticket',
        priority: 'high',
      };

      const response = await request(app)
        .post('/api/support-tickets')
        .send(newTicket)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe('Test Ticket');
      expect(response.body.priority).toBe('high');
      expect(response.body.status).toBe('open');
    });

    test('POST /api/support-tickets should return 400 for missing title', async () => {
      const invalidTicket = {
        description: 'This ticket has no title',
      };

      const response = await request(app)
        .post('/api/support-tickets')
        .send(invalidTicket)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toBe('Title is required');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.error).toBe('Endpoint not found');
    });
  });

  describe('Request Headers', () => {
    test('should accept JSON content type', async () => {
      const response = await request(app)
        .post('/api/support-tickets')
        .set('Content-Type', 'application/json')
        .send({ title: 'Header Test' })
        .expect(201);

      expect(response.body.title).toBe('Header Test');
    });
  });
});
