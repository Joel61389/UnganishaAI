// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title UnganishaPay
 * @dev Escrow contract for startup introductions using USDC on Avalanche Fuji testnet.
 */
contract UnganishaPay {
    address public usdcToken;
    address public platformAdmin;

    enum EscrowStatus { Unpaid, Escrowed, Released, Refunded }

    struct Escrow {
        address sender;
        uint256 amount;
        EscrowStatus status;
        string matchId;
    }

    // Mapping from Match ID string to Escrow details
    mapping(string => Escrow) public escrows;

    event PaymentEscrowed(string indexed matchId, address indexed sender, uint256 amount);
    event PaymentReleased(string indexed matchId, address indexed recipient, uint256 amount);
    event PaymentRefunded(string indexed matchId, address indexed sender, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == platformAdmin, "Only platform admin can perform this action");
        _;
    }

    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "Invalid USDC token address");
        usdcToken = _usdcToken;
        platformAdmin = msg.sender;
    }

    /**
     * @dev Pay the introduction fee in USDC. The funds are held in escrow.
     * @param matchId The unique ID of the AI match.
     * @param amount The USDC amount to deposit (e.g. 5 USDC = 5 * 10^6).
     */
    function requestIntroduction(string calldata matchId, uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(escrows[matchId].status == EscrowStatus.Unpaid, "Payment already exists for this match");

        // Transfer USDC from sender to this escrow contract
        bool success = IERC20(usdcToken).transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed. Ensure approval is sufficient.");

        escrows[matchId] = Escrow({
            sender: msg.sender,
            amount: amount,
            status: EscrowStatus.Escrowed,
            matchId: matchId
        });

        emit PaymentEscrowed(matchId, msg.sender, amount);
    }

    /**
     * @dev Release payment from escrow to the recipient.
     * @param matchId The unique ID of the AI match.
     * @param recipient The address to release funds to (e.g. the other user or platform fee split).
     */
    function releasePayment(string calldata matchId, address recipient) external onlyAdmin {
        Escrow storage escrow = escrows[matchId];
        require(escrow.status == EscrowStatus.Escrowed, "No active escrow for this match");
        require(recipient != address(0), "Invalid recipient address");

        escrow.status = EscrowStatus.Released;
        
        bool success = IERC20(usdcToken).transfer(recipient, escrow.amount);
        require(success, "USDC release transfer failed");

        emit PaymentReleased(matchId, recipient, escrow.amount);
    }

    /**
     * @dev Refund payment back to the sender.
     * @param matchId The unique ID of the AI match.
     */
    function refundPayment(string calldata matchId) external onlyAdmin {
        Escrow storage escrow = escrows[matchId];
        require(escrow.status == EscrowStatus.Escrowed, "No active escrow for this match");

        escrow.status = EscrowStatus.Refunded;
        
        bool success = IERC20(usdcToken).transfer(escrow.sender, escrow.amount);
        require(success, "USDC refund transfer failed");

        emit PaymentRefunded(matchId, escrow.sender, escrow.amount);
    }

    /**
     * @dev Allow platform admin to update the admin address.
     */
    function updateAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid new admin address");
        platformAdmin = newAdmin;
    }
}
