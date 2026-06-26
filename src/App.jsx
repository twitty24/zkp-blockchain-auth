import React, { useState, useEffect } from 'react';
import { registerUser, verifyLoginZKP } from './zkp_helper';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [blockchainLedger, setBlockchainLedger] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);
  
  // State Baru untuk menampung Alamat Wallet MetaMask
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    const savedLedger = localStorage.getItem('blockchain_zkp_auth');
    if (savedLedger) {
      setBlockchainLedger(JSON.parse(savedLedger));
    }
    // Cek apakah user sudah terhubung ke MetaMask sebelumnya
    checkWalletConnected();
  }, []);

  // 🦊 FUNGSI KONEKSI METAMASK (ASLI)
  const checkWalletConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask tidak terdeteksi! Silakan install ekstensi MetaMask di browser kamu.');
      return;
    }
    try {
      setStatusMessage('Menghubungkan ke Web3 Provider (MetaMask)...');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      setIsSuccess(true);
      setStatusMessage('🦊 MetaMask Berhasil Terhubung!');
    } catch (error) {
      setIsSuccess(false);
      setStatusMessage('Koneksi wallet dibatalkan oleh pengguna.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!walletAddress) return alert('Silakan hubungkan MetaMask Wallet terlebih dahulu!');
    if (!username || !password) return alert('Input tidak boleh kosong!');

    try {
      setStatusMessage('Mengompilasi sirkuit kriptografi Poseidon...');
      const secretHash = await registerUser(password);

      const updatedLedger = { ...blockchainLedger, [username]: secretHash };
      localStorage.setItem('blockchain_zkp_auth', JSON.stringify(updatedLedger));
      setBlockchainLedger(updatedLedger);

      setIsSuccess(true);
      setStatusMessage(`Broadcast Sukses! Node Wallet ${walletAddress.substring(0,6)}... merekam Blok baru dengan Hash: ${secretHash.substring(0, 15)}...`);
      setPassword('');
    } catch (error) {
      setIsSuccess(false);
      setStatusMessage('Gagal menghasilkan cryptographic proof.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!walletAddress) return alert('Silakan hubungkan MetaMask Wallet terlebih dahulu!');
    if (!username || !password) return alert('Input tidak boleh kosong!');

    const storedHash = blockchainLedger[username];
    if (!storedHash) {
      setIsSuccess(false);
      setStatusMessage('Username tidak terdaftar pada distributed ledger.');
      return;
    }

    try {
      setStatusMessage('Men-generate bukti zk-SNARKs via client-side...');
      const result = await verifyLoginZKP(password, storedHash);

      if (result.success) {
        setIsSuccess(true);
        setStatusMessage(`Akses Diberikan! Verifikator On-Chain mencocokkan signature dari Wallet: ${walletAddress.substring(0,10)}...`);
      } else {
        setIsSuccess(false);
        setStatusMessage('Akses Ditolak! Bukti verifikasi ZKP salah.');
      }
    } catch (error) {
      setIsSuccess(false);
      setStatusMessage('Terjadi kesalahan pada modul verifikator.');
    }
  };

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '480px',
      width: '100%',
      background: '#0d0e12',
      borderRadius: '16px',
      border: '1px solid rgba(0, 255, 102, 0.15)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      
      {/* Bagian Atas / Top Bar */}
      <div style={{ padding: '25px 30px 15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #14161f' }}>
        <h3 style={{ color: '#ffffff', margin: 0, fontSize: '18px', fontWeight: '700' }}>Zero-Knowledge Auth</h3>
        
        {/* Tombol MetaMask Dinamis */}
        <button 
          onClick={connectWallet}
          style={{
            background: walletAddress ? 'rgba(0, 255, 102, 0.1)' : '#e2761b',
            color: walletAddress ? '#00ff66' : '#ffffff',
            border: walletAddress ? '1px solid rgba(0, 255, 102, 0.3)' : 'none',
            padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          {walletAddress 
            ? `🦊 ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` 
            : '🦊 Connect MetaMask'
          }
        </button>
      </div>

      {/* Area Form */}
      <div style={{ padding: '25px 30px 35px 30px' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div>
            <label style={{ display: 'block', color: '#a3a7b6', marginBottom: '8px', fontSize: '12px', fontWeight: '600' }}>
              Username atau Node ID
            </label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan identitas unik"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px',
                border: '1px solid #222530', background: '#14161f',
                color: '#ffffff', fontSize: '14px', boxSizing: 'border-box', outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a3a7b6', marginBottom: '8px', fontSize: '12px', fontWeight: '600' }}>
              Password Rahasia (Private Input)
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px',
                border: '1px solid #222530', background: '#14161f',
                color: '#ffffff', fontSize: '14px', boxSizing: 'border-box', outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button 
              onClick={handleRegister} 
              style={{
                flex: 1, padding: '12px 18px', background: 'transparent',
                color: '#ffb86c', border: '1px solid rgba(255, 184, 108, 0.4)',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
              }}
            >
              Register Akun
            </button>
            
            <button 
              onClick={handleLogin} 
              style={{
                flex: 1, padding: '12px 18px', 
                background: 'linear-gradient(135deg, #00ff66 0%, #00e0d2 100%)',
                color: '#050608', border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                boxShadow: '0 4px 15px rgba(0, 255, 102, 0.25)'
              }}
            >
               Login
            </button>
          </div>
        </form>

        {statusMessage && (
          <div style={{
            marginTop: '25px', padding: '14px 16px', borderRadius: '8px',
            background: isSuccess ? 'rgba(0, 255, 102, 0.06)' : 'rgba(255, 85, 85, 0.06)',
            border: `1px solid ${isSuccess ? 'rgba(0, 255, 102, 0.2)' : 'rgba(255, 85, 85, 0.2)'}`,
            color: isSuccess ? '#00ff66' : '#ff5555',
            fontSize: '12.5px', lineHeight: '1.4'
          }}>
            {statusMessage}
          </div>
        )}

        {/* Section State Distributed Ledger */}
        <div style={{ marginTop: '30px', borderTop: '1px solid #1f2330', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: '#717585', fontSize: '11px', fontWeight: '600' }}>
              📊 ZKAUTH_SMART_CONTRACT
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', background: walletAddress ? '#00ff66' : '#ff5555', borderRadius: '50%' }}></span>
              <span style={{ color: walletAddress ? '#00ff66' : '#ff5555', fontSize: '11px', fontWeight: '600' }}>
                {walletAddress ? 'RPC_CONNECTED' : 'WALLET_DISCONNECTED'}
              </span>
            </div>
          </div>
          
          <pre style={{
            fontFamily: "'Fira Code', 'Courier New', monospace",
            background: '#07080c', padding: '14px', borderRadius: '8px',
            fontSize: '11.5px', overflowX: 'auto', maxHeight: '120px',
            color: '#a3a7b6', border: '1px solid #14161f', margin: 0
          }}>
            {Object.keys(blockchainLedger).length === 0 
              ? ' Belum ada node terdaftar di jaringan.' 
              : JSON.stringify(blockchainLedger, null, 2)
            }
          </pre>
        </div>

      </div>
    </div>
  );
}