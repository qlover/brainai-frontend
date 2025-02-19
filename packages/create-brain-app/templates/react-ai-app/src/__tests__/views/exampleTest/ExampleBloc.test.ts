import { describe, it, expect } from 'vitest';
import { ExampleBloc } from '@/views/exampleTest/ExampleBloc';

describe('ExampleBloc', () => {
  it('bloc状态应该正确更新', () => {
    const bloc = new ExampleBloc();
    bloc.changeState();

    expect(bloc.state.count.value).toBe(1);
    expect(bloc.state.response.value).toEqual({
      data: [
        {
          id: 1,
          name: 'name 1'
        }
      ]
    });
  });

  it('应该有正确的初始状态', () => {
    const bloc = new ExampleBloc(1);

    expect(bloc.state.count.value).toBe(1);
    expect(bloc.state.response.value).toEqual({
      data: [
        {
          id: 1,
          name: 'name 0'
        }
      ]
    });
  });

  it('多次调用 changeState 应该累加 count', () => {
    const bloc = new ExampleBloc();

    bloc.changeState();
    bloc.changeState();
    bloc.changeState();

    expect(bloc.state.count.value).toBe(3);
  });

  it('调用 resetState 应该重置状态到初始值', () => {
    const bloc = new ExampleBloc();

    // 先改变状态
    bloc.changeState();
    bloc.changeState();

    expect(bloc.state.count.value).toBe(2);

    // 然后重置
    bloc.resetState();

    expect(bloc.state.count.value).toBe(0);
    expect(bloc.state.response.value).toEqual({
      data: [
        {
          id: 1,
          name: 'name 0'
        }
      ]
    });
  });
});
