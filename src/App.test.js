import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders join, start, and reset buttons', () => {
  render(<App />);
  const joinButton = screen.getByRole('button', { name: /join game/i });
  const startButton = screen.getByRole('button', { name: /start game/i });
  const resetButton = screen.getByRole('button', { name: /reset game/i });
  expect(joinButton).toBeInTheDocument();
  expect(startButton).toBeInTheDocument();
  expect(resetButton).toBeInTheDocument();
});

test('start button starts the game', () => {
  const playerData = [
    {
      id: 0,
      name: 'Player 1',
      address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      hand: ['101', '102', '103', '104', '105', '106', '107', '108'],
      ranking: null,
      hasEmptyHand: false,
    },
    {
      id: 1,
      name: 'Player 2',
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      hand: ['201', '202', '203', '204', '205', '206', '207', '208'],
      ranking: null,
      hasEmptyHand: false,
    },
    {
      id: 2,
      name: 'Player 3',
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      hand: ['301', '302', '303', '304', '305', '306', '307', '308'],
      ranking: null,
      hasEmptyHand: false,
    },
    {
      id: 3,
      name: 'Player 4',
      address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      hand: ['401', '402', '403', '404', '405', '406', '407', '408'],
      ranking: null,
      hasEmptyHand: false,
    },
  ];
  render(<App playerData={playerData} gameStarted={true} />);
  const player1Hand = screen.getByText(/Player 1/i);
  const player2Hand = screen.getByText(/Player 2/i);
  const player3Hand = screen.getByText(/Player 3/i);
  const player4Hand = screen.getByText(/Player 4/i);
  expect(player1Hand).toBeInTheDocument();
  expect(player2Hand).toBeInTheDocument();
  expect(player3Hand).toBeInTheDocument();
  expect(player4Hand).toBeInTheDocument();
});

test('reset button resets the game', () => {
  render(<App />);
  const resetButton = screen.getByRole('button', { name: /reset game/i });
  fireEvent.click(resetButton);
  const joinButton = screen.getByRole('button', { name: /join game/i });
  expect(joinButton).toBeInTheDocument();
});

test('join button joins the game', () => {
  render(<App />);
  const joinButton = screen.getByRole('button', { name: /join game/i });
  fireEvent.click(joinButton);
  const numberOfPlayers = screen.getByText(/Number of players: 4/i);
  expect(numberOfPlayers).toBeInTheDocument();
});

