import { describe, it, expect } from 'vitest';
import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useBloc } from '@/uikit/hooks/useBloc';
import { BlocInterface } from '@/base/port/BlocInterface';
import { signal } from '@preact/signals-react';
import { ExampleBlocComponent } from '@/views/exampleTest/ExampleBlocComponent';

// 测试用的 State 类
class TestState {
  count = signal(0);
  name = signal('');
}

// 测试用的 Bloc 类
class TestBloc extends BlocInterface<TestState> {
  constructor(initCount: number, initName: string) {
    super(new TestState());
    this.state.count.value = initCount;
    this.state.name.value = initName;
  }

  increment(): void {
    this.state.count.value += 1;
  }

  setName(name: string): void {
    this.state.name.value = name;
  }
}

describe('useBloc', () => {
  it('应该正确创建带参数的bloc实例', () => {
    const { result } = renderHook(() => useBloc(TestBloc, 10, 'test'));

    expect(result.current.state.count.value).toBe(10);
    expect(result.current.state.name.value).toBe('test');
  });

  it('bloc实例在重渲染时应该保持不变', () => {
    const { result, rerender } = renderHook(() => useBloc(TestBloc, 0, 'test'));

    const originalBloc = result.current;

    // 触发状态更新
    originalBloc.increment();
    expect(result.current.state.count.value).toBe(1);

    // 重新渲染
    rerender();

    // 验证是否是同一个实例
    expect(result.current).toBe(originalBloc);
    expect(result.current.state.count.value).toBe(1);
  });

  it('bloc的方法应该正确更新状态', () => {
    const { result } = renderHook(() => useBloc(TestBloc, 0, 'initial'));

    result.current.increment();
    expect(result.current.state.count.value).toBe(1);

    result.current.setName('updated');
    expect(result.current.state.name.value).toBe('updated');
  });

  it('点击按钮时应该增加计数', async () => {
    render(<ExampleBlocComponent />);

    const button = screen.getByTestId('change-state-button');
    fireEvent.click(button);

    expect(screen.getByTestId('count')).toHaveTextContent('Count: 1');

    fireEvent.click(button);

    expect(screen.getByTestId('count')).toHaveTextContent('Count: 2');
  });
});
