import React, { useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import styles from './Toast.module.css';

class ToastProps {
  constructor(
    public message: string,
    public type: 'success' | 'error'
  ) {}
}

class ToastComponentProps extends ToastProps {
  constructor(
    message: string,
    type: 'success' | 'error',
    public onClose: () => void
  ) {
    super(message, type);
  }
}

let toastRoot: Root | null = null;

export const ToastComponent: React.FC<ToastComponentProps> = ({
  message,
  type,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.message}>{message}</div>
      <button onClick={onClose} className={styles.closeButton}>
        ×
      </button>
    </div>
  );
};

export class Toast {
  private static createRoot(): Root {
    if (!toastRoot) {
      const container = document.createElement('div');
      document.body.appendChild(container);
      toastRoot = createRoot(container);
    }
    return toastRoot;
  }

  static show(message: string, type: 'success' | 'error' = 'success'): void {
    const root = this.createRoot();
    const handleClose = () => {
      root.render(null);
    };

    root.render(
      <ToastComponent message={message} type={type} onClose={handleClose} />
    );
  }

  static success(message: string): void {
    this.show(message, 'success');
  }

  static error(message: string): void {
    this.show(message, 'error');
  }
}
