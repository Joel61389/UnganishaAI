# Smart Contract Deployment - Avalanche Fuji

This directory contains the smart contract code for managing warm introduction payments in UnganishaAI using USDC on the Avalanche Fuji Testnet.

## File Map
- [UnganishaPay.sol](file:///c:/Users/user/my-project/UnganishaAI/contracts/UnganishaPay.sol): The escrow smart contract that handles deposits, releases, and refunds.

## Deployment Details

- **Network**: Avalanche Fuji Testnet (Chain ID `43113`)
- **Fuji RPC URL**: `https://api.avax-test.network/ext/bc/C/rpc`
- **Fuji Block Explorer**: [Snowtrace Fuji](https://testnet.snowtrace.io/)
- **USDC Token Address on Fuji**: `0x5425890298aed601595a70ab815c96711a31bc65`
- **Deployed UnganishaPay Escrow Address**: `0xE9c44569528f11Cc4088A585FaA6e20C83506B62` (Mock deployed address for development/demonstration)

## Verification and Interaction Flow

1. **Request Introduction (Escrow)**:
   - Call `approve` on the USDC token address, granting the `UnganishaPay` contract permission to transfer the fee amount.
   - Call `requestIntroduction(matchId, amount)` on the `UnganishaPay` contract.
   - Funds are locked inside the contract in the state `Escrowed`.

2. **Release (Useful Connection)**:
   - When the warm introduction is verified as useful by both parties (rating >= 4 or useful = true), the platform admin triggers `releasePayment(matchId, recipient)`.
   - The funds are transferred to the recipient or split destination.

3. **Refund (Not Useful / Rejected)**:
   - If the introduction is marked not useful or is rejected, the platform admin triggers `refundPayment(matchId)`.
   - Funds are returned to the sender's wallet address.
