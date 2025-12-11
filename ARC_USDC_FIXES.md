# Arc Network USDC Implementation Fixes

Based on review of: https://docs.arc.network/arc/references/contract-addresses

## Critical Issue Found and Fixed

### Problem
According to Arc documentation:
- **Native USDC** (used in `msg.value`): **18 decimals**
- **USDC ERC-20 interface**: **6 decimals**

The contract was comparing `msg.value` (18 decimals) with `mintingFee` that was documented as 6 decimals, causing a mismatch.

### Solution Applied

1. **Contract (`ImageNFT.sol`)**:
   - Updated comments to clarify `mintingFee` is stored in **18 decimals** (native balance format)
   - This matches `msg.value` which uses 18 decimals

2. **Frontend (`nftContract.ts`)**:
   - **Minting**: Changed from `parseUnits(mintingFee, 6)` to `parseUnits(mintingFee, 18)`
     - Now correctly sends native balance with 18 decimals
   - **Reading Fee**: Updated `getMintingFee()` to:
     - Read from contract (18 decimals)
     - Convert to human-readable format using `formatUnits(fee, 18)`
     - Format to 6 decimal places for display consistency

## Current Implementation Status

### ✅ Correctly Implemented

1. **USDC Contract Address**: `0x3600000000000000000000000000000000000000` ✓
   - Matches official Arc documentation

2. **Balance Reading**: Using ERC-20 interface with 6 decimals ✓
   - `getBalance()` uses `balanceOf()` from ERC-20 contract
   - Formats with 6 decimals: `formatUnits(balance, 6)`
   - Follows Arc recommendation: "rely solely on the standard ERC-20 interface"

3. **Minting Fee Payment**: Now uses 18 decimals ✓
   - `parseUnits(mintingFee, 18)` for native balance
   - Matches contract's `msg.value` comparison

4. **Minting Fee Display**: Correctly converts 18→6 decimals ✓
   - Reads from contract (18 decimals)
   - Displays in human-readable format (6 decimals)

## Arc Network Documentation Compliance

✅ **Contract Address**: Correct
✅ **ERC-20 Interface**: Used for balance reading (6 decimals)
✅ **Native Balance**: Used for payments (18 decimals)
✅ **Decimal Handling**: Consistent throughout

## Testing Recommendations

1. Test minting with various fee amounts
2. Verify balance display shows correct USDC amounts
3. Test that minting fee comparison works correctly
4. Verify contract deployment uses 18 decimals for initial fee

## Notes

- The contract uses `payable` function with `msg.value`, which requires 18 decimals
- Balance display uses ERC-20 interface (6 decimals) as recommended by Arc
- All conversions are now properly handled

