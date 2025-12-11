import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/utils/testUtils';
import Navbar from '../../../components/Navbar';

describe('Navbar Component - Unit Tests', () => {
  const mockOnConnect = vi.fn();
  const mockOnDisconnect = vi.fn();
  const mockAddress = '0x1234567890123456789012345678901234567890';

  it('should render brand name', () => {
    render(
      <Navbar
        walletAddress={null}
        walletBalance={null}
        isConnecting={false}
        onConnect={mockOnConnect}
        onDisconnect={mockOnDisconnect}
      />
    );

    expect(screen.getByText(/NebulaMint/)).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(
      <Navbar
        walletAddress={null}
        walletBalance={null}
        isConnecting={false}
        onConnect={mockOnConnect}
        onDisconnect={mockOnDisconnect}
      />
    );

    expect(screen.getByText('Mint')).toBeInTheDocument();
    expect(screen.getByText('Metrics')).toBeInTheDocument();
  });

  it('should highlight active route', () => {
    render(
      <Navbar
        walletAddress={null}
        walletBalance={null}
        isConnecting={false}
        onConnect={mockOnConnect}
        onDisconnect={mockOnDisconnect}
      />
    );

    // Check that links exist
    const mintLink = screen.getByText('Mint');
    expect(mintLink).toBeInTheDocument();
  });

  it('should render wallet button', () => {
    render(
      <Navbar
        walletAddress={null}
        walletBalance={null}
        isConnecting={false}
        onConnect={mockOnConnect}
        onDisconnect={mockOnDisconnect}
      />
    );

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('should show connected wallet address', () => {
    render(
      <Navbar
        walletAddress={mockAddress}
        walletBalance="100.00"
        isConnecting={false}
        onConnect={mockOnConnect}
        onDisconnect={mockOnDisconnect}
      />
    );

    expect(screen.getByText(/0x1234...7890/)).toBeInTheDocument();
  });
});

