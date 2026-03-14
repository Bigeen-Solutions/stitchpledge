export const ERROR_MAP: Record<string, string> = {
  'AUTH_INVALID_CREDENTIALS': 'The email or password provided is incorrect.',
  'AUTH_ACCOUNT_LOCKED': 'Your account has been locked due to too many failed attempts.',
  'ORDER_NOT_FOUND': 'The requested order production record could not be found.',
  'ORDER_CAPACITY_EXCEEDED': 'Warning: Workshop capacity limit reached for this period.',
  'GENERIC_ERROR': 'A system error occurred. Our engineering team has been notified.',
};

export function mapErrorCode(code: string | undefined): string {
  if (!code) return ERROR_MAP.GENERIC_ERROR;
  return ERROR_MAP[code] || ERROR_MAP.GENERIC_ERROR;
}
