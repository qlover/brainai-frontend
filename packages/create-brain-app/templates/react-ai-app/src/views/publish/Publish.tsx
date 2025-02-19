import { Modal } from '@/views/components/modal/Modal';
import { QRCodeSVG } from 'qrcode.react';
import styles from './Publish.module.css';
import { PublishStore } from '@/base/store/PublishStore';
import { GetIt } from '@/config/register/GetIt';
import { useStore } from '@/uikit/hooks/useStore';

export function Publish(props: {
  isCopied: boolean;
  setIsCopied: (bool: boolean) => void;
  handleCopy: () => void;
}) {
  const publishStore = GetIt.get(PublishStore);
  const publishStoreState = useStore(publishStore);

  return (
    <Modal
      title=""
      isOpen={publishStoreState.showPublishPopup}
      onClose={() => {
        publishStore.closePublishPopup();
        props.setIsCopied(false);
      }}
    >
      <div className={styles.wrapper}>
        <div className={styles.title}>Congratulations!</div>
        <p className={styles.description}>
          Your app is published and live online
        </p>
        <div className={styles.qrcodeWrapper}>
          <QRCodeSVG value={publishStoreState.publishedUrl} />
        </div>
        <div className={styles.urlWrapper}>
          <a
            href={publishStoreState.publishedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.urlText}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1976d2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#2196f3';
            }}
          >
            {publishStoreState.publishedUrl}
          </a>
        </div>
        <div className={styles.buttonGroup}>
          <button
            onClick={() =>
              window.open(publishStoreState.publishedUrl, '_blank')
            }
            className={styles.visitButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1976d2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2196f3';
            }}
          >
            View Site
          </button>
          <button
            onClick={props.handleCopy}
            className={styles.copyButton}
            style={{ opacity: props.isCopied ? 0.7 : 1 }}
            onMouseEnter={(e) => {
              if (!props.isCopied) {
                e.currentTarget.style.background = '#f5f5f5';
              }
            }}
            onMouseLeave={(e) => {
              if (!props.isCopied) {
                e.currentTarget.style.background = 'white';
              }
            }}
          >
            {props.isCopied ? 'Copied' : 'Copy URL'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
