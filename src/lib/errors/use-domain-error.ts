import { useToastStore } from '../../components/feedback/Toast';
import { parseApiError } from './parse-api-error';

/**
 * Hook to handle domain errors in a centralized way.
 * Connects API error parsing with the UI (toasts or form field errors).
 */
export function useDomainError() {
  const { showToast } = useToastStore();

  /**
   * Processes an error and displays it to the user.
   * 
   * @param error - The error to handle (AxiosError, Error, etc.)
   * @param setFieldError - Optional function from React Hook Form to highlight a specific field
   */
  const handleError = (error: unknown, setFieldError?: (field: any, error: { message: string }) => void) => {
    const message = parseApiError(error);

    // If there's a specific field targeted and we have a setter, highlight it
    if (message.field && setFieldError) {
      setFieldError(message.field, { message: message.detail });
      return;
    }

    // Otherwise, show a prominent toast notification
    showToast(message.title, message.detail, 'error');
  };

  return { handleError };
}
