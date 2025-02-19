import { SaveProjectService } from '@/base/services/SaveProjectService';
import { SaveStore } from '@/base/store/SaveStore';
import { GetIt } from '@/config/register/GetIt';
import { useStore } from '@/uikit/hooks/useStore';
import { Tooltip } from 'antd';

export type SaveButtonProps = {
  className?: string;
};

export function SaveButton({ className }: SaveButtonProps) {
  const saveProjectService = GetIt.get(SaveProjectService);
  const saveStore = GetIt.get(SaveStore);
  const saveStoreState = useStore(saveStore);

  return (
    <Tooltip title="Save your changes">
      <button
        data-testid="SaveButton"
        onClick={() =>
          saveProjectService.save({
            message: 'Project saved successfully'
          })
        }
        className={className}
        disabled={saveStoreState.saveLoading}
      >
        <span>{saveStoreState.saveLoading ? 'Saving...' : 'Save'}</span>
      </button>
    </Tooltip>
  );
}
