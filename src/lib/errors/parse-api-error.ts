import axios, { AxiosError } from 'axios';
import type { ErrorMessage } from './error-messages';
import type { ErrorCode } from './error-codes';
import { errorMessages } from './error-messages';
import { ErrorCodes } from './error-codes';

/**
 * Parses an unknown error (likely from an API call) into a user-friendly ErrorMessage object.
 * Following the API Consumption Doctrine: never display raw backend messages or stack traces.
 */
export function parseApiError(error: unknown): ErrorMessage {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ code?: string }>;

    // 1. Check for domain-specific error code in response body
    const errorCode = axiosError.response?.data?.code;
    if (errorCode) {
      const mappedMessage = errorMessages[errorCode as ErrorCode];
      if (mappedMessage) {
        return mappedMessage;
      }
      
      // Fallback for unknown domain codes
      return errorMessages[ErrorCodes.UNKNOWN_ERROR];
    }

    // 2. Check for network/connection errors (no response from server)
    if (!axiosError.response) {
      return {
        title: 'Connection Error',
        detail: 'Could not reach the server. Check your connection.',
      };
    }
  }

  // 3. Generic fallback for non-Axios errors or unexpected response structures
  return errorMessages[ErrorCodes.UNKNOWN_ERROR];
}
