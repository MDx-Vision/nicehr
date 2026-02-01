/**
 * Correlation ID Integration Tests
 *
 * Tests the correlation ID middleware integration with the API.
 * Verifies that correlation IDs are properly generated and propagated.
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import express, { Express, Request, Response } from 'express';
import { correlationIdMiddleware, RESPONSE_HEADERS } from '../../server/middleware/correlationId';
import { getCorrelationId, getRequestId } from '../../server/structuredLogger';

describe('Correlation ID Integration', () => {
  let app: Express;

  beforeAll(() => {
    app = express();

    // Apply correlation ID middleware
    app.use(correlationIdMiddleware);

    // Test endpoint that returns correlation info
    app.get('/api/test/correlation', (req: Request, res: Response) => {
      res.json({
        correlationId: getCorrelationId(),
        requestId: getRequestId(),
        fromRequest: (req as any).correlationId,
      });
    });

    // Test endpoint for header propagation
    app.get('/api/test/headers', (req: Request, res: Response) => {
      res.json({
        receivedCorrelationId: req.headers['x-correlation-id'],
        receivedRequestId: req.headers['x-request-id'],
      });
    });
  });

  describe('Correlation ID Generation', () => {
    test('should generate correlation ID when none provided', async () => {
      const response = await request(app)
        .get('/api/test/correlation')
        .expect(200);

      // Response should have correlation header
      expect(response.headers[RESPONSE_HEADERS.CORRELATION_ID.toLowerCase()]).toBeDefined();
      expect(response.headers[RESPONSE_HEADERS.REQUEST_ID.toLowerCase()]).toBeDefined();

      // Body should have correlation info
      expect(response.body.correlationId).toBeDefined();
      expect(response.body.correlationId).not.toBe('no-context');
    });

    test('should use provided X-Correlation-ID header', async () => {
      const customId = 'custom-correlation-123';

      const response = await request(app)
        .get('/api/test/correlation')
        .set('X-Correlation-ID', customId)
        .expect(200);

      expect(response.headers[RESPONSE_HEADERS.CORRELATION_ID.toLowerCase()]).toBe(customId);
      expect(response.body.fromRequest).toBe(customId);
    });

    test('should use provided X-Request-ID header as correlation ID', async () => {
      const customId = 'request-id-456';

      const response = await request(app)
        .get('/api/test/correlation')
        .set('X-Request-ID', customId)
        .expect(200);

      expect(response.headers[RESPONSE_HEADERS.CORRELATION_ID.toLowerCase()]).toBe(customId);
    });

    test('should use provided X-B3-TraceId header (Zipkin)', async () => {
      const customId = 'zipkin-trace-789';

      const response = await request(app)
        .get('/api/test/correlation')
        .set('X-B3-TraceId', customId)
        .expect(200);

      expect(response.headers[RESPONSE_HEADERS.CORRELATION_ID.toLowerCase()]).toBe(customId);
    });

    test('should prioritize X-Correlation-ID over other headers', async () => {
      const response = await request(app)
        .get('/api/test/correlation')
        .set('X-Correlation-ID', 'correlation-wins')
        .set('X-Request-ID', 'request-loses')
        .set('X-B3-TraceId', 'trace-loses')
        .expect(200);

      expect(response.headers[RESPONSE_HEADERS.CORRELATION_ID.toLowerCase()]).toBe('correlation-wins');
    });
  });

  describe('Request ID Generation', () => {
    test('should always generate unique request ID', async () => {
      const response1 = await request(app).get('/api/test/correlation').expect(200);
      const response2 = await request(app).get('/api/test/correlation').expect(200);

      const requestId1 = response1.headers[RESPONSE_HEADERS.REQUEST_ID.toLowerCase()];
      const requestId2 = response2.headers[RESPONSE_HEADERS.REQUEST_ID.toLowerCase()];

      expect(requestId1).toBeDefined();
      expect(requestId2).toBeDefined();
      expect(requestId1).not.toBe(requestId2);
    });

    test('request ID should be different from correlation ID', async () => {
      const response = await request(app)
        .get('/api/test/correlation')
        .expect(200);

      const correlationId = response.headers[RESPONSE_HEADERS.CORRELATION_ID.toLowerCase()];
      const requestId = response.headers[RESPONSE_HEADERS.REQUEST_ID.toLowerCase()];

      expect(correlationId).not.toBe(requestId);
    });
  });

  describe('Response Headers', () => {
    test('should set X-Correlation-ID response header', async () => {
      const response = await request(app)
        .get('/api/test/correlation')
        .expect(200);

      expect(response.headers).toHaveProperty(RESPONSE_HEADERS.CORRELATION_ID.toLowerCase());
    });

    test('should set X-Request-ID response header', async () => {
      const response = await request(app)
        .get('/api/test/correlation')
        .expect(200);

      expect(response.headers).toHaveProperty(RESPONSE_HEADERS.REQUEST_ID.toLowerCase());
    });
  });

  describe('UUID Format', () => {
    test('generated correlation ID should be valid UUID format', async () => {
      const response = await request(app)
        .get('/api/test/correlation')
        .expect(200);

      const correlationId = response.headers[RESPONSE_HEADERS.CORRELATION_ID.toLowerCase()];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(correlationId).toMatch(uuidRegex);
    });

    test('generated request ID should be valid UUID format', async () => {
      const response = await request(app)
        .get('/api/test/correlation')
        .expect(200);

      const requestId = response.headers[RESPONSE_HEADERS.REQUEST_ID.toLowerCase()];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(requestId).toMatch(uuidRegex);
    });
  });
});
