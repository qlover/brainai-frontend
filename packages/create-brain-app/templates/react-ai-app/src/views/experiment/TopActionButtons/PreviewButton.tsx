import { PreviewStore } from '@/base/store/PreviewStore';
import { ProjectStore } from '@/base/store/ProjectStore';
import { GetIt } from '@/config/register/GetIt';
import { useStore } from '@/uikit/hooks/useStore';
import { Tooltip } from 'antd';

export type PreviewButtonProps = {
  className?: string;
};

export function PreviewButton({ className }: PreviewButtonProps) {
  const previewStore = GetIt.get(PreviewStore);
  const projectStore = GetIt.get(ProjectStore);
  const projectStoreState = useStore(projectStore);

  return (
    <Tooltip title="Preview your app">
      <button
        data-testid="PreviewButton"
        onClick={() => previewStore.triggerPopup()}
        className={className}
        disabled={
          !projectStoreState.hasPreviewUrl && !projectStoreState.metadata.code
        }
      >
        <span>Preview</span>
      </button>
    </Tooltip>
  );
}
