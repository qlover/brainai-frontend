import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { ExampleBlocComponent } from '@/views/exampleTest/ExampleBlocComponent';

describe('ExampleBlocComponent', () => {
  it('应该正确渲染初始状态', () => {
    render(<ExampleBlocComponent />);
    expect(screen.getByTestId('count')).toHaveTextContent('Count: 0');
  });

  it('点击按钮时应该增加计数', async () => {
    render(<ExampleBlocComponent />);

    const button = screen.getByTestId('change-state-button');
    fireEvent.click(button);

    expect(screen.getByTestId('count')).toHaveTextContent('Count: 1');

    fireEvent.click(button);

    expect(screen.getByTestId('count')).toHaveTextContent('Count: 2');
  });

  it('多级嵌套数据, name 应该正确渲染', async () => {
    render(<ExampleBlocComponent />);
    const button = screen.getByTestId('change-state-button');

    fireEvent.click(button);

    // 验证 count 更新
    expect(screen.getByTestId('count')).toHaveTextContent('Count: 1');

    fireEvent.click(button);

    // 验证 response 更新
    expect(screen.getByTestId('name')).toHaveTextContent(
      JSON.stringify({
        data: [
          {
            id: 1,
            name: 'name 2' // 这里的值应该和更新后的 count 对应
          }
        ]
      })
    );
  });
});
