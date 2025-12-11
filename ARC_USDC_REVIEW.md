# Arc Network USDC Implementation Review

Based on: https://docs.arc.network/arc/references/contract-addresses

## Current Implementation Status

### ✅ Correct Implementations

1. **USDC Contract Address**: `0x3600000000000000000000000000000000000000` ✓
   - Matches official Arc documentation

2. **Balance Reading**: Using ERC-20 interface with 6 decimals ✓
   - `getBalance()` uses `balanceOf()` from ERC-20 contract
   - Formats with 6 decimals: `formatUnits(balance, 6)`
   - Follows best practice: "rely solely on the standard ERC-20 interface"

3. **Minting Fee Retrieval**: Using 6 decimals ✓
   - `getMintingFee()` formats with 6 decimals
   - Correct for ERC-20 interface

### ⚠️ Potential Issues

1. **Minting Fee Payment**: Using 6 decimals for `msg.value` ⚠️
   - **Problem**: Contract's `mint()` function is `payable` and uses `msg.value`
   - **Issue**: `msg.value` represents native balance (18 decimals), not ERC-20 (6 decimals)
   - **Current**: `parseUnits(mintingFee, 6)` - sends 6 decimal amount
   - **Expected**: Native balance uses 18 decimals
   - **Impact**: If mintingFee is stored in contract with 6 decimals but compared to msg.value (18 decimals), amounts won't match

2. **Contract Minting Fee Storage**: Need to verify
   - How is `mintingFee` stored in the contract?
   - If stored with 6 decimals but compared to msg.value (18 decimals), there's a mismatch

## Arc Network Documentation Key Points

From https://docs.arc.network/arc/references/contract-addresses:

> "On Arc, the **native USDC gas token** uses 18 decimals of precision, while the **USDC ERC-20 interface** uses 6 decimals."

> "For applications integrating USDC, it's recommended to rely solely on the standard ERC-20 interface for reading balances and sending transfers."

> "The ERC-20 function call directly affects native USDC balance movements."

## Recommendations

### Option 1: Use ERC-20 Transfer (Recommended)
Instead of using `msg.value` (native balance), use ERC-20 `transferFrom`:
- More consistent with Arc's recommendation
- Uses 6 decimals throughout
- Requires approval step

### Option 2: Fix Native Balance Handling
If keeping `msg.value`:
- Store mintingFee in contract with 18 decimals
- Send mintingFee with 18 decimals: `parseUnits(mintingFee, 18)`
- Ensure contract comparison uses 18 decimals

### Option 3: Hybrid Approach
- Read balances using ERC-20 (6 decimals) ✓ (already doing this)
- For payments, use native balance (18 decimals) but convert correctly

## Action Items

1. ✅ Verify contract's `mintingFee` storage format
2. ⚠️ Fix minting fee payment to use correct decimals
3. ✅ Add comments explaining decimal handling
4. ✅ Consider using ERC-20 transfer instead of msg.value

