import { message } from 'antd';
import { SaveButton } from './SaveButton';
import { PreviewButton } from './PreviewButton';
import { PublishButton } from './PublishButton';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LayoutBloc } from '@/views/layout/LayoutBloc';
import styles from './TopActionButtons.module.css';

export function TopActionButtons({ bloc }: { bloc: LayoutBloc }) {
  const [messageApi, contextHolder] = message.useMessage();

  const showActions = bloc.state.showActions.value;

  return (
    <div className={styles.topActionButtons}>
      {contextHolder}

      {showActions && (
        <span className={styles.actionButton} onClick={() => bloc.toDocPage()}>
          Api Docs
        </span>
      )}

      {showActions && <SaveButton className={styles.actionButton} />}

      {showActions && <PreviewButton className={styles.actionButton} />}

      {showActions && (
        <PublishButton
          className={styles.actionButton}
          messageApi={messageApi}
        />
      )}

      {showActions && <ThemeSwitcher className={styles.actionButton} />}

      {!showActions && (
        <span
          className={styles.actionButton}
          onClick={() => bloc.onCloseButton()}
        >
          X
        </span>
      )}
    </div>
  );
}
