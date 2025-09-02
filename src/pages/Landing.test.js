import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from './Landing';

test('renders landing page with welcome message', () => {
  render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );
  const headingElement = screen.getByText(/Welcome to Your Final Year/i);
  expect(headingElement).toBeInTheDocument();
});
