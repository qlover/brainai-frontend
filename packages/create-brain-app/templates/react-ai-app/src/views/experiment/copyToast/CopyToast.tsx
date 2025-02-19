import { ExperimentBloc } from '@/pages/Experiment/ExperimentBloc';
import styles from './CopyToast.module.css';

interface CopyToastProps {
  bloc: ExperimentBloc;
}

export function CopyToast({ bloc }: CopyToastProps) {
  if (!bloc.state.showCopyToast.value) {
    return null;
  }

  return (
    <>
      <div className={styles.toast}>
        <span className={styles.checkmark}>✓</span>
        <span className={styles.message}>Copied successfully</span>
        <button
          onClick={() => (bloc.state.showCopyToast.value = false)}
          className={styles.closeButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
        >
          ×
        </button>
      </div>
    </>
  );
}
