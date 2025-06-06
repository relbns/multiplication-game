import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
// import { vi } from 'vitest'; // Not needed if full flow tests are removed
import MultiplicationGame from './MultiplicationGame';

// The core game logic (question generation, difficulty settings, etc.)
// is now unit-tested in src/common/gameLogic.test.js.
// This file can be used for component-specific integration tests or smoke tests
// that verify basic rendering and interaction if desired.

describe('MultiplicationGame Component', () => {
  it('should render the menu screen with difficulty buttons by default', () => {
    render(<MultiplicationGame />);
    // Check for a unique element on the menu screen, e.g., the main title or a specific button
    expect(screen.getByText('לוח הכפל')).toBeInTheDocument();
    expect(screen.getByText(/🌟 קל \(1, 2, 5, 10\)/i)).toBeInTheDocument();
    expect(screen.getByText(/⭐ בינוני \(3, 4, 9\)/i)).toBeInTheDocument();
    expect(screen.getByText(/🔥 קשה \(6, 7, 8\)/i)).toBeInTheDocument();
    expect(screen.getByText(/👑 אלופות \(1-10\)/i)).toBeInTheDocument();
  });

  // Add other high-level component integration tests here if needed,
  // for example, testing navigation between menu, game, and game over screens,
  // but without exhaustively testing the question generation logic itself.
});
