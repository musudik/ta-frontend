declare module 'sonner' {
  import { ReactNode } from 'react';

  interface ToasterProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    expand?: boolean;
    richColors?: boolean;
    duration?: number;
    theme?: 'light' | 'dark' | 'system';
    className?: string;
    offset?: string | number;
    children?: ReactNode;
  }

  interface ToastOptions {
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    icon?: ReactNode;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  }

  interface Toast {
    (message: string, options?: ToastOptions): void;
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
    warning: (message: string, options?: ToastOptions) => void;
  }

  export function Toaster(props?: ToasterProps): JSX.Element;
  export const toast: Toast;
  export function dismiss(toastId?: string): void;
  export function promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ): Promise<T>;
} 