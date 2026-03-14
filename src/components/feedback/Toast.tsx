import { create } from 'zustand';

interface Toast {
  type: 'success' | 'error';
  message: string;
}

interface ToastState {
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  hideToast: () => set({ toast: null }),
}));

export function Toast() {
  const { toast } = useToastStore();

  if (!toast) return null;

  return (
    <div className={`sf-toast sf-glass ${toast.type}`} style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '12px 24px',
      borderRadius: 'var(--radius-card)',
      zIndex: 9999,
      border: `1px solid ${toast.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
      color: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
      fontWeight: 'bold',
      boxShadow: 'var(--shadow-md)',
      animation: 'slideIn 0.3s ease-out'
    }}>
      {toast.message}
    </div>
  );
}
