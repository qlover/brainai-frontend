import { Dropdown, MenuProps } from 'antd';
import { GetIt } from '@/config/register/GetIt';
import { ProjectStore } from '@/base/store/ProjectStore';
import { PublishStore } from '@/base/store/PublishStore';
import { useStore } from '@/uikit/hooks/useStore';
import { PublishService } from '@/base/services/PublishService';
import { MessageInstance } from 'antd/es/message/interface';
import styles from './TopActionButtons.module.css';

export type PublishButtonProps = {
  className?: string;
  messageApi: MessageInstance;
};

function CopyLink({ messageApi }: { messageApi: MessageInstance }) {
  const projectStore = GetIt.get(ProjectStore);

  const handleCopyLink = async () => {
    if (projectStore.state.properties.publishUrl) {
      try {
        await navigator.clipboard.writeText(
          projectStore.state.properties.publishUrl
        );
        messageApi.success({
          content: 'Copied successfully',
          duration: 3
        });
      } catch (err) {
        console.error('Failed to copy:', err);
        messageApi.error({
          content: 'Failed to copy',
          duration: 3
        });
      }
    }
  };

  return (
    <a onClick={handleCopyLink} data-testid="PublishButton-CopyLink">
      <span className={styles.tooltipIcon}>🔗</span>
      Copy published link
    </a>
  );
}

function ViewLink() {
  const publishService = GetIt.get(PublishService);

  return (
    <a
      onClick={(e) => {
        e.preventDefault();
        publishService.triggerPublish();
      }}
      data-testid="PublishButton-ViewLink"
    >
      <span className={styles.tooltipIcon}>📱</span>
      View published URL
    </a>
  );
}

function Unpublish() {
  const publishService = GetIt.get(PublishService);
  const publishStore = GetIt.get(PublishStore);
  const publishStoreState = useStore(publishStore);

  return (
    <a
      onClick={(e) => {
        e.preventDefault();
        publishService.unPublish();
      }}
      style={{
        cursor: publishStoreState.unPublishLoading ? 'wait' : 'pointer',
        opacity: publishStoreState.unPublishLoading ? 0.7 : 1
      }}
      data-testid="PublishButton-Unpublish"
    >
      <span className={styles.tooltipIcon}>🚫</span>
      <span className={styles.unpublishText}>
        {publishStoreState.unPublishLoading
          ? 'Unpublishing...'
          : 'Unpublish app'}
      </span>
    </a>
  );
}

export function PublishButton({ className, messageApi }: PublishButtonProps) {
  const projectStore = GetIt.get(ProjectStore);
  const publishStore = GetIt.get(PublishStore);
  const publishService = GetIt.get(PublishService);

  const projectStoreState = useStore(projectStore);
  const publishStoreState = useStore(publishStore);

  const items: MenuProps['items'] = [
    {
      key: 'copy',
      label: <CopyLink messageApi={messageApi} />
    },
    {
      key: 'view',
      label: <ViewLink />
    },
    {
      key: 'unpublish',
      label: <Unpublish />
    }
  ];

  return (
    <Dropdown
      menu={{ items }}
      placement="bottomRight"
      trigger={['hover']}
      disabled={
        !projectStoreState.properties?.publishUrl ||
        !projectStoreState.hasPreviewUrl
      }
    >
      <button
        data-testid="PublishButton"
        onClick={() => publishService.publish()}
        className={className}
        disabled={
          publishStoreState.publishLoading ||
          (!projectStoreState.hasPreviewUrl && !projectStoreState.metadata.code)
        }
      >
        <span>
          {publishStoreState.publishLoading ? 'Publishing...' : 'Publish'}
        </span>
      </button>
    </Dropdown>
  );
}
