import { render, screen } from '@testing-library/react';
import { ExampleTest } from '@/views/exampleTest/ExampleTest';

describe('ExampleTest', () => {
  it('应该正确渲染子组件内容', () => {
    const testText = '测试内容';
    render(<ExampleTest>{testText}</ExampleTest>);

    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it('应该能够渲染复杂的子组件结构', () => {
    render(
      <ExampleTest>
        <div data-testid="child-div">
          <span>嵌套内容</span>
        </div>
      </ExampleTest>
    );

    expect(screen.getByTestId('child-div')).toBeInTheDocument();
    expect(screen.getByText('嵌套内容')).toBeInTheDocument();
  });
});
