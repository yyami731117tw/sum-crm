import React from 'react';
import { render, screen } from '@testing-library/react';
import { TableView } from '../TableView';

describe('TableView Component', () => {
  it('renders without crashing', () => {
    render(<TableView />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('displays table headers correctly', () => {
    render(<TableView />);
    expect(screen.getByText('標題')).toBeInTheDocument();
    expect(screen.getByText('建立時間')).toBeInTheDocument();
    expect(screen.getByText('更新時間')).toBeInTheDocument();
  });
}); 