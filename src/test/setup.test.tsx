import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('test setup', () => {
  it('provides jest-dom matchers for rendered components', () => {
    render(<p>Setup test content</p>);
    expect(screen.getByText('Setup test content')).toBeInTheDocument();
  });

  it('cleans up rendered components between tests', () => {
    expect(screen.queryByText('Setup test content')).not.toBeInTheDocument();
  });
});
