import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('HostelCart App Component (Phase 2)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders application brand and navigation links', () => {
    render(<App />);

    // Brand check
    expect(screen.getAllByText(/Hostel/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Cart/i)[0]).toBeInTheDocument();

    // Key navigation elements
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Join with Code/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders landing hero text on root route', () => {
    render(<App />);
    expect(screen.getByText(/Shop Together/i)).toBeInTheDocument();
    expect(screen.getByText(/Save Together/i)).toBeInTheDocument();
  });
});
