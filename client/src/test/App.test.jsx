import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../components/App.jsx';

test('renders learn github link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Visit Our Github/i);
  expect(linkElement).toBeInTheDocument();
});
