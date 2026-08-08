// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CeilingRegistry {
    struct Session {
        bytes32 policyHash;
        uint256 unitPrice;
        uint256 maxUnits;
        bytes32 outputHash;
        uint256 acceptedUnits;
        uint256 settledAmount;
        bool finalized;
    }

    mapping(bytes32 sessionId => Session) public sessions;
    mapping(bytes32 sessionId => address) public sessionCreator;

    event SessionCommitted(
        bytes32 indexed sessionId,
        address indexed creator,
        bytes32 indexed policyHash,
        uint256 unitPrice,
        uint256 maxUnits
    );
    event OutcomeRecorded(
        bytes32 indexed sessionId,
        bytes32 indexed outputHash,
        uint256 acceptedUnits,
        uint256 settledAmount
    );

    error SessionAlreadyCommitted();
    error SessionNotFound();
    error SessionAlreadyFinalized();
    error UnauthorizedRecorder();
    error AcceptedUnitsExceedMaximum();
    error SettledAmountMismatch();
    error InvalidMaxUnits();

    function commitSession(
        bytes32 sessionId,
        bytes32 policyHash,
        uint256 unitPrice,
        uint256 maxUnits
    ) external {
        if (sessionCreator[sessionId] != address(0)) revert SessionAlreadyCommitted();
        if (maxUnits == 0) revert InvalidMaxUnits();

        sessions[sessionId] = Session({
            policyHash: policyHash,
            unitPrice: unitPrice,
            maxUnits: maxUnits,
            outputHash: bytes32(0),
            acceptedUnits: 0,
            settledAmount: 0,
            finalized: false
        });
        sessionCreator[sessionId] = msg.sender;

        emit SessionCommitted(sessionId, msg.sender, policyHash, unitPrice, maxUnits);
    }

    function recordOutcome(
        bytes32 sessionId,
        bytes32 outputHash,
        uint256 acceptedUnits,
        uint256 settledAmount
    ) external {
        address creator = sessionCreator[sessionId];
        if (creator == address(0)) revert SessionNotFound();
        if (msg.sender != creator) revert UnauthorizedRecorder();

        Session storage session = sessions[sessionId];
        if (session.finalized) revert SessionAlreadyFinalized();
        if (acceptedUnits > session.maxUnits) revert AcceptedUnitsExceedMaximum();
        if (settledAmount != acceptedUnits * session.unitPrice) {
            revert SettledAmountMismatch();
        }

        session.outputHash = outputHash;
        session.acceptedUnits = acceptedUnits;
        session.settledAmount = settledAmount;
        session.finalized = true;

        emit OutcomeRecorded(sessionId, outputHash, acceptedUnits, settledAmount);
    }
}
