import { useBloc } from '@/uikit/hooks/useBloc';
import { ExampleBloc } from './ExampleBloc';

export function ExampleBlocComponent() {
  const bloc = useBloc(ExampleBloc);

  return (
    <div data-testid="bloc-component">
      <button
        onClick={() => {
          bloc.changeState();
        }}
        data-testid="change-state-button"
      >
        change state
      </button>
      <div data-testid="count">Count: {bloc.state.count.value}</div>
      <div data-testid="name">
        Name: {JSON.stringify(bloc.state.response.value)}
      </div>
    </div>
  );
}
