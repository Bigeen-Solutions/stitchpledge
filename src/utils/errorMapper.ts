export const ERROR_MAP: Record<string, string> = {
  'AUTH_INVALID_CREDENTIALS': 'The email or password provided is incorrect.',
  'AUTH_ACCOUNT_LOCKED': 'Your account has been locked due to too many failed attempts.',
  'ORDER_NOT_FOUND': 'The requested order production record could not be found.',
  'CAPACITY_EXCEEDED': 'Warning: Workshop capacity limit reached. Consider delaying intake.',
  'GENERIC_ERROR': 'Technical synchronization issue. Please retry or contact workshop support.',
};

export function mapErrorCode(code: string | undefined): string {
  if (!code) return ERROR_MAP.GENERIC_ERROR;
  return ERROR_MAP[code] || ERROR_MAP.GENERIC_ERROR;
}
