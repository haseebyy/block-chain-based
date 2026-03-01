// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CarDocumentVerification {
    struct Vehicle {
        string vehicleUid;
        string registrationNumber;
        string engineNumber;
        string chassisNumber;
        bool exists;
        uint256 createdAt;
    }

    struct DocumentRecord {
        string vehicleUid;
        string documentHash;
        string documentType;
        uint256 timestamp;
        address recordedBy;
        bool exists;
    }

    struct OwnershipTransfer {
        string vehicleUid;
        string fromUser;
        string toUser;
        uint256 timestamp;
        address recordedBy;
    }

    mapping(string => Vehicle) private vehicles;
    mapping(string => DocumentRecord) private documentsByHash;
    mapping(string => OwnershipTransfer[]) private ownershipHistory;

    event VehicleRegistered(string indexed vehicleUid, string registrationNumber, uint256 timestamp);
    event DocumentHashStored(string indexed vehicleUid, string indexed documentHash, string documentType, uint256 timestamp);
    event OwnershipTransferred(string indexed vehicleUid, string fromUser, string toUser, uint256 timestamp);

    function registerVehicle(
        string calldata vehicleUid,
        string calldata registrationNumber,
        string calldata engineNumber,
        string calldata chassisNumber
    ) external {
        require(!vehicles[vehicleUid].exists, "Vehicle already exists");
        vehicles[vehicleUid] = Vehicle({
            vehicleUid: vehicleUid,
            registrationNumber: registrationNumber,
            engineNumber: engineNumber,
            chassisNumber: chassisNumber,
            exists: true,
            createdAt: block.timestamp
        });
        emit VehicleRegistered(vehicleUid, registrationNumber, block.timestamp);
    }

    function storeDocumentHash(
        string calldata vehicleUid,
        string calldata documentHash,
        string calldata documentType
    ) external {
        require(vehicles[vehicleUid].exists, "Vehicle does not exist");
        require(!documentsByHash[documentHash].exists, "Document hash already exists");

        documentsByHash[documentHash] = DocumentRecord({
            vehicleUid: vehicleUid,
            documentHash: documentHash,
            documentType: documentType,
            timestamp: block.timestamp,
            recordedBy: msg.sender,
            exists: true
        });

        emit DocumentHashStored(vehicleUid, documentHash, documentType, block.timestamp);
    }

    function recordOwnershipTransfer(
        string calldata vehicleUid,
        string calldata fromUser,
        string calldata toUser
    ) external {
        require(vehicles[vehicleUid].exists, "Vehicle does not exist");
        ownershipHistory[vehicleUid].push(
            OwnershipTransfer({
                vehicleUid: vehicleUid,
                fromUser: fromUser,
                toUser: toUser,
                timestamp: block.timestamp,
                recordedBy: msg.sender
            })
        );

        emit OwnershipTransferred(vehicleUid, fromUser, toUser, block.timestamp);
    }

    function getVehicle(string calldata vehicleUid) external view returns (Vehicle memory) {
        require(vehicles[vehicleUid].exists, "Vehicle does not exist");
        return vehicles[vehicleUid];
    }

    function getDocumentByHash(string calldata documentHash) external view returns (DocumentRecord memory) {
        require(documentsByHash[documentHash].exists, "Document hash not found");
        return documentsByHash[documentHash];
    }

    function getOwnershipHistoryCount(string calldata vehicleUid) external view returns (uint256) {
        return ownershipHistory[vehicleUid].length;
    }
}
