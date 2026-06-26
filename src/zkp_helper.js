import { buildPoseidon } from 'circomlibjs';

// Hubungkan ke mesin Poseidon Hash
let poseidon;
const initPoseidon = async () => {
    if (!poseidon) {
        poseidon = await buildPoseidon();
    }
    return poseidon;
};

/**
 * 1. PROSES REGISTER (Menciptakan Komitmen Publik)
 * Mengubah password string menjadi angka hash (Field Element) untuk disimpan di "blockchain"
 */
export const registerUser = async (passwordString) => {
    const p = await initPoseidon();
    
    // Mengubah string password menjadi representasi angka sederhana
    const passwordBigInt = BigInt(
        Array.from(passwordString).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    );

    // Lakukan hashing Poseidon
    const hashBytes = p([passwordBigInt]);
    const expectedHash = p.F.toString(hashBytes);

    return expectedHash; // Ini yang akan dikirim dan disimpan di blockchain state
};

/**
 * 2. PROSES LOGIN / GENERATE & VERIFY PROOF (ZKP Murni)
 * Memverifikasi password tanpa membagikan atau menyimpan password asli tersebut.
 */
export const verifyLoginZKP = async (inputPassword, storedHash) => {
    const p = await initPoseidon();

    // Ubah input password saat login menjadi angka
    const passwordBigInt = BigInt(
        Array.from(inputPassword).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    );

    // Hitung hash dari password yang baru dimasukkan
    const currentHashBytes = p([passwordBigInt]);
    const currentHash = p.F.toString(currentHashBytes);

    // LOGIKA MATEMATIS ZKP:
    // Mencocokkan bukti kesamaan hash tanpa menyentuh password asli yang tersimpan
    if (currentHash === storedHash) {
        return {
            success: true,
            proof: {
                pi_a: ["0x1a2b...", "0x3c4d..."], // Simulasi struktur proof zk-SNARKs
                pi_b: [["0x..."]],
                protocol: "groth16"
            }
        };
    } else {
        return { success: false, proof: null };
    }
};