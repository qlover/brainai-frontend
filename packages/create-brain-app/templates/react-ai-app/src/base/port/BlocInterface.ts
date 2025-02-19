import { Signal } from '@preact/signals-react';

export type SignalState<T> = {
  // eslint-disable-next-line
  [K in keyof T]: T[K] extends Signal<any> ? T[K] : T[K] | Signal<T[K]>;
};

export abstract class BlocInterface<T> {
  constructor(public state: SignalState<T>) {}
}
