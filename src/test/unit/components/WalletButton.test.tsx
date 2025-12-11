import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/utils/testUtils';
import WalletButton from '../../../components/WalletButton';

describe('WalletButton Component - Unit Tests', () => {
  const mockOnConnect = vi.fn();
  const mockOnDisconnect = vi.fn();

  describe('Disconnected State', () => {
    it('should render connect button when not connected', () => {
      render(
        <WalletButton
          address={null}
          balance={null}
          isConnecting={false}
          onConnect={mockOnConnect}
          onDisconnect={mockOnDisconnect}
        />
      );

      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });

    it('should show loading state when connecting', () => {
      render(
        <WalletButton
          address={null}
          balance={null}
          isConnecting={true}
          onConnect={mockOnConnect}
          onDisconnect={mockOnDisconnect}
        />
      );

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('should call onConnect when button is clicked', async () => {
      const userEvent = await import('@testing-library/user-event');
      const user = userEvent.default.setup();

      render(
        <WalletButton
          address={null}
          balance={null}
          isConnecting={false}
          onConnect={mockOnConnect}
          onDisconnect={mockOnDisconnect}
        />
      );

      const button = screen.getByText('Connect Wallet');
      await user.click(button);

      expect(mockOnConnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Connected State', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';

    it('should render address when connected', () => {
      render(
        <WalletButton
          address={mockAddress}
          balance="100.00"
          isConnecting={false}
          onConnect={mockOnConnect}
          onDisconnect={mockOnDisconnect}
        />
      );

      expect(screen.getByText(/0x1234...7890/)).toBeInTheDocument();
    });

    it('should display balance when provided', () => {
      render(
        <WalletButton
          address={mockAddress}
          balance="100.00"
          isConnecting={false}
          onConnect={mockOnConnect}
          onDisconnect={mockOnDisconnect}
        />
      );

      // Balance is displayed in a separate div
      expect(screen.getByText(/USDC:/)).toBeInTheDocument();
      expect(screen.getByText(/100.00/)).toBeInTheDocument();
    });

    it('should call onDisconnect when button is clicked', async () => {
      const userEvent = await import('@testing-library/user-event');
      const user = userEvent.default.setup();

      render(
        <WalletButton
          address={mockAddress}
          balance="100.00"
          isConnecting={false}
          onConnect={mockOnConnect}
          onDisconnect={mockOnDisconnect}
        />
      );

      const button = screen.getByText(/0x1234...7890/).closest('button');
      if (button) {
        await user.click(button);
        expect(mockOnDisconnect).toHaveBeenCalledTimes(1);
      }
    });

    it('should format address correctly', () => {
      render(
        <WalletButton
          address={mockAddress}
          balance={null}
          isConnecting={false}
          onConnect={mockOnConnect}
          onDisconnect={mockOnDisconnect}
        />
      );

      // Should show first 6 and last 4 characters
      expect(screen.getByText(/0x1234...7890/)).toBeInTheDocument();
    });
  });
});

