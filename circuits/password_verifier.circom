pragma circom 2.0.0;

// Menggunakan template hash Poseidon dari library circomlib
include "../node_modules/circomlib/circuits/poseidon.circom";

template PasswordVerifier() {
    // 1. INPUTS
    signal input password; // Private: Hanya user yang tahu
    signal input expectedHash; // Public: Tersimpan di blockchain/state

    // 2. LOGIKA MATEMATIS
    // Kita gunakan komponen Poseidon dengan 1 input (yaitu password)
    component hasher = Poseidon(1);
    hasher.inputs[0] <== password;

    // 3. CONSTRAINT (Batasan/Verifikasi)
    // Memastikan hasil hash dari password SAMA DENGAN expectedHash
    hasher.out === expectedHash;
}

// Menentukan komponen utama dan memberi tahu mana input yang boleh dipublikasikan
component main {public [expectedHash]} = PasswordVerifier();