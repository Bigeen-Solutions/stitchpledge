import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { parseApiError } from './parse-api-error';
import { ErrorCodes } from './error-codes';
import { errorMessages } from './error-messages';

// Mock axios.isAxiosError
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      ...actual.default,
      isAxiosError: (err: any) => err && err.isAxiosError === true,
    },
    isAxiosError: (err: any) => err && err.isAxiosError === true,
  };
});

describe('parseApiError', () => {
  it('returns correct mapped message for known domain code', () => {
    const error = {
      isAxiosError: true,
      response: {
        data: { code: ErrorCodes.CAPACITY_LIMIT_EXCEEDED },
      },
    };
    
    const result = parseApiError(error);
    expect(result).toEqual(errorMessages.CAPACITY_LIMIT_EXCEEDED);
  });

  it('returns UNKNOWN_ERROR for unknown domain code', () => {
    const error = {
      isAxiosError: true,
      response: {
        data: { code: 'TOTALLY_UNKNOWN_CODE' },
      },
    };
    
    const result = parseApiError(error);
    expect(result).toEqual(errorMessages.UNKNOWN_ERROR);
  });

  it('returns connection error message for network error (no response)', () => {
    const error = {
      isAxiosError: true,
      // no response property
    };
    
    const result = parseApiError(error);
    expect(result.title).toBe('Connection Error');
    expect(result.detail).toContain('Check your connection');
  });

  it('returns UNKNOWN_ERROR for non-Axios error', () => {
    const error = new Error('Some random error');
    
    const result = parseApiError(error);
    expect(result).toEqual(errorMessages.UNKNOWN_ERROR);
  });

  it('returns correct message for validation error with field', () => {
    const error = {
      isAxiosError: true,
      response: {
        data: { code: ErrorCodes.MATERIAL_PHOTO_REQUIRED },
      },
    };
    
    const result = parseApiError(error);
    expect(result).toEqual(errorMessages.MATERIAL_PHOTO_REQUIRED);
    expect(result.field).toBe('photoUrl');
  });
});
