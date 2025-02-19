import { ExperimentBloc } from '@/pages/Experiment/ExperimentBloc';
import styles from './CommandInput.module.css';

interface CommandInputProps {
  bloc: ExperimentBloc;
}

export function CommandInput({ bloc }: CommandInputProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {bloc.state.apiSuggestions.value && (
          <div className={styles.suggestionBox}>
            <div className={styles.suggestionTitle}>
              Suggested APIs:{' '}
              {bloc.state.apiSuggestions.value.selectedApiNames?.join(', ')}
            </div>
            <div className={styles.suggestionDescription}>
              {bloc.state.apiSuggestions.value.explanation}
            </div>
          </div>
        )}
        <form
          onSubmit={
            bloc.state.isFirstQuery.value
              ? (e) => bloc.handleCommandSubmit(e)
              : (e) => bloc.handleUpdateSubmit(e)
          }
        >
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={bloc.state.command.value}
              onChange={(e) => bloc.handleCommandChange(e)}
              placeholder={
                bloc.state.isFirstQuery.value
                  ? 'Enter your design request...'
                  : 'Enter update comment...'
              }
              className={styles.input}
              disabled={bloc.state.loading.value}
            />
            <button
              type="submit"
              disabled={
                bloc.state.loading.value || !bloc.state.command.value.trim()
              }
              className={styles.button}
            >
              {bloc.state.loading.value
                ? 'Processing...'
                : bloc.state.isFirstQuery.value
                  ? 'Generate'
                  : 'Update'}
            </button>
          </div>
        </form>
      </div>
      {bloc.state.error.value && (
        <div className={styles.error}>Error: {bloc.state.error.value}</div>
      )}
    </div>
  );
}
