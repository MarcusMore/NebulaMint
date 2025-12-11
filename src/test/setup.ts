import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.ethereum for wallet tests
Object.defineProperty(window, 'ethereum', {
  writable: true,
  value: undefined,
});

// Mock environment variables
vi.mock('../vite-env.d.ts', () => ({
  default: {},
}));

// Global test utilities
global.expect = expect;

