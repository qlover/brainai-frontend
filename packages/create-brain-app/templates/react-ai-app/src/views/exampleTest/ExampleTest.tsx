import { ReactNode } from 'react';

export function ExampleTest({ children }: { children: ReactNode }) {
  return <div data-testid="example-test">{children}</div>;
}
