import { useRef, useState } from 'react';
import styles from './ResultDisplay.module.css';
import { ProjectStore } from '@/base/store/ProjectStore';
import { GetIt } from '@/config/register/GetIt';
import { useStore } from '@/uikit/hooks/useStore';
import { PreviewStore } from '@/base/store/PreviewStore';

export function ResultDisplay() {
  const projectStore = GetIt.get(ProjectStore);
  const previewStore = GetIt.get(PreviewStore);
  const previewStoreState = useStore(previewStore);

  const projectStoreState = useStore(projectStore);

  const [previewKey, setPreviewKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePreviewRefresh = () => {
    setPreviewKey((prev) => prev + 1);
  };

  if (!previewStoreState.showPopup) {
    return null;
  }

  return (
    <div className={styles.resultDisplay}>
      <div className={styles.resultHeader}>
        <h3 className={styles.resultTitle}>Live Preview</h3>
        <div className={styles.resultActions}>
          <button
            className={styles.refreshButton}
            onClick={handlePreviewRefresh}
          >
            <span>🔄</span> Refresh Preview
          </button>
          <button
            className={styles.closeButton}
            onClick={() => previewStore.closePopup()}
          >
            ✕
          </button>
        </div>
      </div>
      <div className={styles.previewContainer}>
        <iframe
          {...(projectStoreState.metadata.code
            ? { srcDoc: projectStoreState.metadata.code }
            : {
                src: `${projectStoreState.properties.previewUrl}?t=${new Date().getTime()}`
              })}
          referrerPolicy="no-referrer"
          key={previewKey}
          ref={iframeRef}
          className={styles.previewIframe}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
}
