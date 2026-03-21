import type { ErrorCode } from './error-codes';

export type ErrorMessage = {
  title: string;           // Short heading for toast or alert
  detail: string;          // Actionable explanation for the user
  field?: string;          // If present, which form field to highlight
};

export const errorMessages: Record<ErrorCode, ErrorMessage> = {
  AUTH_TOKEN_MISSING: {
    title: 'Session Required',
    detail: 'Please log in to continue.',
  },
  AUTH_PAYLOAD_MALFORMED: {
    title: 'Authentication Error',
    detail: 'The authentication request was malformed. Please try again.',
  },
  AUTH_SESSION_EXPIRED: {
    title: 'Session Expired',
    detail: 'Your session has expired. Logging you out.',
  },
  CAPACITY_LIMIT_EXCEEDED: {
    title: 'Workshop Full',
    detail: 'The workshop has reached its active order limit. Complete existing orders before adding new ones.',
  },
  MATERIAL_PHOTO_REQUIRED: {
    title: 'Photo Required',
    detail: 'A photo of the material must be attached before logging this entry.',
    field: 'photoUrl',
  },
  MATERIAL_DELTA_ZERO: {
    title: 'Invalid Quantity',
    detail: 'The quantity adjustment cannot be zero.',
    field: 'quantityDelta',
  },
  MEASUREMENT_ORDER_LOCKED: {
    title: 'Order Locked',
    detail: 'This order is locked. New measurements cannot be added to a completed order.',
  },
  ORDER_EVENT_DATE_REQUIRED: {
    title: 'Event Date Required',
    detail: 'An event date is required to calculate the production deadline.',
    field: 'eventDate',
  },
  ORDER_NOT_FOUND: {
    title: 'Order Not Found',
    detail: 'This order does not exist or you do not have access to it.',
  },
  WORKFLOW_STAGE_SKIP: {
    title: 'Stage Cannot Be Skipped',
    detail: 'Workflow stages must be completed in order. Complete the current stage first.',
  },
  WORKFLOW_INVALID_TRANSITION: {
    title: 'Invalid Stage Transition',
    detail: 'This workflow transition is not permitted from the current stage.',
  },
  TENANT_MISMATCH: {
    title: 'Access Denied',
    detail: 'You do not have permission to access data for this tenant.',
  },
  VALIDATION_ERROR: {
    title: 'Check Your Inputs',
    detail: 'One or more fields have invalid values. Please review and correct them.',
  },
  UNKNOWN_ERROR: {
    title: 'Unexpected Error',
    detail: 'Something went wrong on our end. Please try again or contact support.',
  },
};
