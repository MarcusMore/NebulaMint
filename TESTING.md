# Testing Documentation

## Testing Pyramid Overview

This project follows the **Testing Pyramid** approach with three layers:

```
        /\
       /E2E\          ← Few tests, high-level user flows
      /------\
     /Integration\    ← Medium tests, component interactions
    /------------\
   /    Unit      \   ← Many tests, individual functions/components
  /----------------\
```

## Test Structure

```
src/test/
├── unit/              # Unit tests (base of pyramid)
│   ├── services/      # Service layer tests
│   ├── components/    # Component tests
│   └── utils/         # Utility function tests
├── integration/       # Integration tests (middle)
│   └── mintingFlow.test.ts
├── e2e/              # End-to-end tests (top)
│   └── minting.e2e.test.ts
├── mocks/            # Mock data and utilities
└── utils/            # Test utilities
```

## Running Tests

### Unit Tests
```bash
npm run test
```

### Unit Tests with UI
```bash
npm run test:ui
```

### Coverage Report
```bash
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
```

### E2E Tests with UI
```bash
npm run test:e2e:ui
```

### All Tests
```bash
npm run test:all
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Cover all critical flows
- **E2E Tests**: Cover main user journeys

## Test Categories

### 1. Unit Tests (Base Layer)

#### Services
- `arcWallet.test.ts` - Wallet connection, network switching, balance fetching
- `ipfsStorage.test.ts` - IPFS upload, metadata storage, API key validation
- `nftContract.test.ts` - Contract interactions, minting, fee retrieval

#### Components
- `WalletButton.test.tsx` - Wallet connection UI, state management
- `PreviewCard.test.tsx` - Image preview display, loading states
- `Navbar.test.tsx` - Navigation, active routes

#### Utilities
- `formatting.test.ts` - Address formatting, USDC formatting, date formatting

### 2. Integration Tests (Middle Layer)

#### Minting Flow
- Complete minting process (IPFS → Blockchain)
- Error handling across services
- Data validation throughout flow

### 3. E2E Tests (Top Layer)

#### User Flows
- Complete minting journey
- Navigation between pages
- Error scenarios
- Wallet interactions

## Writing New Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myModule';

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Component Test Example
```typescript
import { render, screen } from '../test/utils/testUtils';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Integration Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { serviceA } from '../services/serviceA';
import { serviceB } from '../services/serviceB';

describe('Service Integration', () => {
  it('should work together', async () => {
    const resultA = await serviceA();
    const resultB = await serviceB(resultA);
    expect(resultB).toBeDefined();
  });
});
```

## Mocking

### Wallet Mocking
Use `src/test/mocks/wallet.mock.ts` for wallet-related tests.

### Environment Variables
Mock environment variables in test setup:
```typescript
import.meta.env.VITE_CONTRACT_ADDRESS = '0x...';
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Names**: Use descriptive test names
3. **AAA Pattern**: Arrange, Act, Assert
4. **Mock External Dependencies**: Don't make real API calls in unit tests
5. **Test Edge Cases**: Include error scenarios and boundary conditions
6. **Keep Tests Fast**: Unit tests should run in milliseconds
7. **Maintain Coverage**: Aim for 80%+ code coverage

## Continuous Integration

Tests should run automatically on:
- Pull requests
- Commits to main branch
- Before deployments

## Debugging Tests

### Vitest
```bash
npm run test -- --reporter=verbose
```

### Playwright
```bash
npm run test:e2e:ui
```

## Coverage Reports

Coverage reports are generated in `coverage/` directory:
- HTML report: `coverage/index.html`
- JSON report: `coverage/coverage-final.json`

