import React, { useState, useEffect } from 'react';
import { registerUser, verifyLoginZKP } from './zkp_helper';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [blockchainLedger, setBlockchainLedger] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    const savedLedger = localStorage.getItem('blockchain_zkp_auth');
    if (savedLedger) {
      setBlockchainLedger(JSON.parse(savedLedger));
    }
    checkWalletConnected();
  }, []);

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
      alert('MetaMask tidak terdeteksi! Silakan pasang ekstensi MetaMask.');
      return;
    }
    try {
      setStatusMessage('Menghubungkan ke Web3 Provider...');
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
    if (!walletAddress) return alert('Hubungkan MetaMask terlebih dahulu!');
    if (!username || !password) return alert('Input tidak boleh kosong!');

    try {
      setStatusMessage('Mengompilasi sirkuit kriptografi Poseidon...');
      const secretHash = await registerUser(password);

      const updatedLedger = { ...blockchainLedger, [username]: secretHash };
      localStorage.setItem('blockchain_zkp_auth', JSON.stringify(updatedLedger));
      setBlockchainLedger(updatedLedger);

      setIsSuccess(true);
      setStatusMessage(`Blok baru terekam! Hash: ${secretHash.substring(0, 20)}...`);
      setPassword('');
    } catch (error) {
      setIsSuccess(false);
      setStatusMessage('Gagal menghasilkan cryptographic proof.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!walletAddress) return alert('Hubungkan MetaMask terlebih dahulu!');
    if (!username || !password) return alert('Input tidak boleh kosong!');

    const storedHash = blockchainLedger[username];
    if (!storedHash) {
      setIsSuccess(false);
      setStatusMessage('Username tidak terdaftar di ledger.');
      return;
    }

    try {
      setStatusMessage('Men-generate bukti zk-SNARKs...');
      const result = await verifyLoginZKP(password, storedHash);

      if (result.success) {
        setIsSuccess(true);
        setStatusMessage('Akses Diberikan! Konsensus ZKP terverifikasi.');
      } else {
        setIsSuccess(false);
        setStatusMessage('Akses Ditolak! Bukti ZKP tidak valid.');
      }
    } catch (error) {
      setIsSuccess(false);
      setStatusMessage('Terjadi kesalahan pada modul verifikator.');
    }
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      maxWidth: '520px',
      width: '100%',
      background: '#11131c',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 255, 136, 0.02)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      
      {/* HEADER: Lebih Luas & Rapi */}
      <div style={{ 
        padding: '30px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: '#151824',
        borderBottom: '1px solid rgba(255, 255, 255, 0.03)' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 style={{ color: '#ffffff', margin: 0, fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px' }}>
            ZK-Auth Portal
          </h3>
          <span style={{ color: '#656a7e', fontSize: '11px', fontWeight: '500' }}>Cryptography Verification</span>
        </div>
        
        <button 
          onClick={connectWallet}
          style={{
            background: walletAddress ? 'rgba(0, 255, 136, 0.08)' : '#e2761b',
            color: walletAddress ? '#00ff88' : '#ffffff',
            border: walletAddress ? '1px solid rgba(0, 255, 136, 0.2)' : 'none',
            padding: '10px 16px', 
            borderRadius: '12px', 
            fontSize: '12px', 
            fontWeight: '600', 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={(e) => { if(!walletAddress) e.target.style.background = '#d46a15'; }}
          onMouseOut={(e) => { if(!walletAddress) e.target.style.background = '#e2761b'; }}
        >
          {walletAddress 
            ? `🦊 ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` 
            : '🦊 Connect MetaMask'
          }
        </button>
      </div>

      {/* FORM & LEDGER CONTENT */}
      <div style={{ padding: '35px 30px' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          <div>
            <label style={{ display: 'block', color: '#8a90a6', marginBottom: '8px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.3px' }}>
              USERNAME 
            </label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan identitas unik"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '12px',
                border: '1px solid #222634', background: '#161925',
                color: '#ffffff', fontSize: '14px', boxSizing: 'border-box', 
                outline: 'none', transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00ff88'}
              onBlur={(e) => e.target.style.borderColor = '#222634'}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#8a90a6', marginBottom: '8px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.3px' }}>
              PASSWORD 
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '12px',
                border: '1px solid #222634', background: '#161925',
                color: '#ffffff', fontSize: '14px', boxSizing: 'border-box', 
                outline: 'none', transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00e0d2'}
              onBlur={(e) => e.target.style.borderColor = '#222634'}
            />
          </div>

          {/* BUTTONS: Sejajar & Tinggi Presisi */}
          <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
            <button 
              onClick={handleRegister} 
              style={{
                flex: 1, height: '46px', background: 'transparent',
                color: '#ffb86c', border: '1px solid rgba(255, 184, 108, 0.3)',
                borderRadius: '12px', cursor: 'pointer', fontWeight: '600', 
                fontSize: '13.5px', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.target.style.background = 'rgba(255, 184, 108, 0.04)'; e.target.style.borderColor = '#ffb86c'; }}
              onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(255, 184, 108, 0.3)'; }}
            >
              Register 
            </button>
            
            <button 
              onClick={handleLogin} 
              style={{
                flex: 1, height: '46px', 
                background: 'linear-gradient(135deg, #00ff88 0%, #00e0d2 100%)',
                color: '#090a0f', border: 'none', borderRadius: '12px',
                cursor: 'pointer', fontWeight: '700', fontSize: '13.5px',
                boxShadow: '0 4px 20px rgba(0, 255, 136, 0.15)',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.9'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              Login
            </button>
          </div>
        </form>

        {/* LOG MESSAGES: Lebih Bersih & Proporsional */}
        {statusMessage && (
          <div style={{
            marginTop: '25px', padding: '14px 18px', borderRadius: '12px',
            background: isSuccess ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 85, 85, 0.05)',
            border: `1px solid ${isSuccess ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 85, 85, 0.15)'}`,
            color: isSuccess ? '#00ff88' : '#ff5555',
            fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '14px' }}>{isSuccess ? '⚡' : '⚠️'}</span>
            <span>{statusMessage}</span>
          </div>
        )}

        {/* DISTRIBUTED LEDGER STATE */}
        <div style={{ marginTop: '35px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '25px' }}>
          <div style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#656a7e', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
              📊 ZKAUTH SMART CONTRACT LEDGER STATE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', background: walletAddress ? '#00ff88' : '#ff5555', borderRadius: '50%' }}></span>
              <span style={{ color: walletAddress ? '#00ff88' : '#ff5555', fontSize: '11px', fontWeight: '600' }}>
                {walletAddress ? 'RPC CONNECTED' : 'WALLET DISCONNECTED'}
              </span>
            </div>
          </div>
          
          <pre style={{
            fontFamily: '"Fira Code", "Courier New", monospace',
            background: '#0a0b10', padding: '16px', borderRadius: '12px',
            fontSize: '12px', overflowX: 'auto', maxHeight: '120px',
            color: '#a3a7b6', border: '1px solid rgba(255,255,255,0.02)', margin: 0
          }}>
            {Object.keys(blockchainLedger).length === 0 
              ? 'Belum ada node terdaftar di jaringan.' 
              : JSON.stringify(blockchainLedger, null, 2)
            }
          </pre>
        </div>

      </div>
    </div>
  );
}