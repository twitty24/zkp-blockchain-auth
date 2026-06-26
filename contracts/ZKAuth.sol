// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ZKAuth {
    // Mapping untuk menyimpan data "Username => Poseidon Hash" di dalam Blockchain State
    mapping(string => uint256) private userRegisterLedger;

    event UserRegistered(string username, uint256 identityHash);
    event ZKPVerificationPassed(string username, string status);

    // 1. FUNGSI REGISTER ON-CHAIN
    // Menyimpan hasil hash dari sirkuit client ke dalam blockchain storage
    function registerUserNode(string memory _username, uint256 _identityHash) public {
        require(userRegisterLedger[_username] == 0, "Node ID sudah terdaftar di jaringan!");
        userRegisterLedger[_username] = _identityHash;
        emit UserRegistered(_username, _identityHash);
    }

    // 2. FUNGSI AMBIL HASH DATA (Untuk dApp Frontend)
    function getUserHash(string memory _username) public view returns (uint256) {
        return userRegisterLedger[_username];
    }

    // 3. FUNGSI VERIFIKASI CONSENSUS ZKP (MOCK VERIFIER FROM CIRCOM/SNARKJS)
    // Fungsi ini menerima proof dari frontend dan mencocokkannya secara on-chain
    function verifyZKPProof(
        string memory _username,
        uint256 _currentInputHash,
        bytes memory _simulatedProof
    ) public returns (bool) {
        uint256 storedHash = userRegisterLedger[_username];
        require(storedHash != 0, "Node identitas tidak ditemukan!");

        // Logika Matematika Konsensus ZKP di Blockchain:
        // Smart contract memverifikasi kecocokan hash tanpa pernah tahu password aslinya
        if (_currentInputHash == storedHash) {
            emit ZKPVerificationPassed(_username, "SUCCESS_VERIFIED");
            return true;
        }
        
        return false;
    }
}