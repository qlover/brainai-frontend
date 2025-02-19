import { Signal, signal } from '@preact/signals-react';
import { BlocInterface } from '@/base/port/BlocInterface';

export type Response = {
  data: {
    id: number;
    name: string;
  }[];
};

class State {
  count: Signal<number>;
  response = signal<Response>({
    data: [
      {
        id: 1,
        name: 'name 0'
      }
    ]
  });

  constructor(initCount = 0) {
    this.count = signal(initCount);
  }
}

export class ExampleBloc extends BlocInterface<State> {
  constructor(initCount = 0) {
    super(new State(initCount));
  }

  changeState(): void {
    this.state.count.value += 1;

    const newResponse = this.state.response.value;

    newResponse.data[0].name = 'name ' + this.state.count.value;

    this.state.response.value = { ...newResponse };
  }

  resetState(initCount = 0): void {
    this.state = new State(initCount);
  }
}
