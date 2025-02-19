import { useRef, useEffect } from 'react';
import styles from './ProjectTitle.module.css';
import { ProjectTitleBloc } from './ProjectTitleBloc';
import { useBloc } from '@/uikit/hooks/useBloc';
import { GetIt } from '@/config/register/GetIt';
import { ProjectStore } from '@/base/store/ProjectStore';
import { useStore } from '@/uikit/hooks/useStore';

export const ProjectTitle = ({
  onSave
}: {
  onSave: (newTitle: string) => Promise<void>;
}) => {
  const projectStore = GetIt.get(ProjectStore);
  const projectStoreState = useStore(projectStore);
  const bloc = useBloc(ProjectTitleBloc);
  bloc.setProps({ onSave });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bloc.updateTitle();
  }, [projectStoreState.metadata.name]);

  return (
    <div className={styles.container}>
      {bloc.state.isEditing.value ? (
        <div>
          <input
            ref={inputRef}
            type="text"
            value={bloc.state.editValue.value}
            onChange={(e) => (bloc.state.editValue.value = e.target.value)}
            onBlur={() => bloc.handleSave()}
            onKeyDown={(e) => bloc.handleKeyDown(e)}
            className={`${styles.input} ${bloc.state.error.value ? styles.inputError : ''}`}
            disabled={bloc.state.isSaving.value}
          />
          {bloc.state.error.value && (
            <div className={styles.errorMessage}>{bloc.state.error.value}</div>
          )}
        </div>
      ) : (
        <h1
          onDoubleClick={() => bloc.handleDoubleClick()}
          className={`${styles.title} ${bloc.isLoading ? styles.loading : ''}`}
        >
          {bloc.isLoading ? 'Loading...' : bloc.state.currentTitle.value}
        </h1>
      )}

      {bloc.state.showSavePrompt.value && (
        <div
          className={styles.savePrompt}
          onKeyDown={(e) => bloc.handleKeyDown(e)}
          tabIndex={0}
        >
          <p>Save changes?</p>
          <div className={styles.buttonGroup}>
            <button
              onClick={() => bloc.confirmSave()}
              className={styles.saveButton}
              disabled={bloc.state.isSaving.value}
            >
              {bloc.state.isSaving.value ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => bloc.handleCancel()}
              className={styles.cancelButton}
              disabled={bloc.state.isSaving.value}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
