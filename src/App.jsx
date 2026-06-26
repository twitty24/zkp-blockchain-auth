import React, { useState, useEffect } from 'react';
import { registerUser, verifyLoginZKP } from './zkp_helper';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [blockchainLedger, setBlockchainLedger] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);

  useEffect(() => {
    const savedLedger = localStorage.getItem('blockchain_zkp_auth');
    if (savedLedger) {
      setBlockchainLedger(JSON.parse(savedLedger));
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) return alert('Input tidak boleh kosong!');

    try {
      setStatusMessage('Mengompilasi sirkuit kriptografi Poseidon...');
      const secretHash = await registerUser(password);

      const updatedLedger = { ...blockchainLedger, [username]: secretHash };
      localStorage.setItem('blockchain_zkp_auth', JSON.stringify(updatedLedger));
      setBlockchainLedger(updatedLedger);

      setIsSuccess(true);
      setStatusMessage(`Sukses merekam data ke blok baru! Hash ID: ${secretHash.substring(0, 24)}...`);
      setPassword('');
    } catch (error) {
      setIsSuccess(false);
      setStatusMessage('Gagal menghasilkan cryptographic proof.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return alert('Input tidak boleh kosong!');

    const storedHash = blockchainLedger[username];
    if (!storedHash) {
      setIsSuccess(false);
      setStatusMessage('Username tidak terdaftar pada distributed ledger.');
      return;
    }

    try {
      setStatusMessage('Men-generate bukti zk-SNARKs...');
      const result = await verifyLoginZKP(password, storedHash);

      if (result.success) {
        setIsSuccess(true);
        setStatusMessage('Akses Diberikan! Konsensus ZKP berhasil memverifikasi kunci identitas Anda.');
        console.log("ZKP Proof Verified:", result.proof);
      } else {
        setIsSuccess(false);
        setStatusMessage('Akses Ditolak! Bukti verifikasi tidak cocok.');
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
      boxShadow: '0 20px 40px rgba(0,0,0,0.7), 0 0 50px rgba(0, 255, 102, 0.03)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      
      {/* Header Aplikasi Premium */}
      <div style={{ padding: '35px 30px 20px 30px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block', 
          background: 'rgba(0, 255, 102, 0.1)', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          fontSize: '11px', 
          color: '#00ff66', 
          fontWeight: '600',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '15px',
          border: '1px solid rgba(0, 255, 102, 0.2)'
        }}>
          🛡️ Cryptographic Protocol
        </div>
        <h2 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>
          Zero-Knowledge Auth
        </h2>
        <p style={{ color: '#717585', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
          Autentikasi berbasis blockchain murni menggunakan konsensus kriptografi tanpa menyimpan password asli.
        </p>
      </div>

      {/* Area Form */}
      <div style={{ padding: '0 30px 35px 30px' }}>
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
                color: '#ffffff', fontSize: '14px', boxSizing: 'border-box', 
                outline: 'none', transition: 'border 0.2s'
              }}
              onFocus={(e) => e.target.style.border = '1px solid #00ff66'}
              onBlur={(e) => e.target.style.border = '1px solid #222530'}
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
                color: '#ffffff', fontSize: '14px', boxSizing: 'border-box', 
                outline: 'none', transition: 'border 0.2s'
              }}
              onFocus={(e) => e.target.style.border = '1px solid #00f0ff'}
              onBlur={(e) => e.target.style.border = '1px solid #222530'}
            />
          </div>

          {/* Tombol yang Lebih Umum & Elegan */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button 
              onClick={handleRegister} 
              style={{
                flex: 1, padding: '12px 18px', background: 'transparent',
                color: '#ffb86c', border: '1px solid rgba(255, 184, 108, 0.4)',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '600', 
                fontSize: '13px', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 184, 108, 0.05)';
                e.target.style.borderColor = '#ffb86c';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'rgba(255, 184, 108, 0.4)';
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
                boxShadow: '0 4px 15px rgba(0, 255, 102, 0.25)',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.9'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
               Login
            </button>
          </div>
        </form>

        {/* Kotak Log Status Informasi */}
        {statusMessage && (
          <div style={{
            marginTop: '25px', padding: '14px 16px', borderRadius: '8px',
            background: isSuccess ? 'rgba(0, 255, 102, 0.06)' : 'rgba(255, 85, 85, 0.06)',
            border: `1px solid ${isSuccess ? 'rgba(0, 255, 102, 0.2)' : 'rgba(255, 85, 85, 0.2)'}`,
            color: isSuccess ? '#00ff66' : '#ff5555',
            fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '8px',
            lineHeight: '1.4'
          }}>
            <span>{isSuccess ? '⚡' : '⚠️'}</span>
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Section State Distributed Ledger */}
        <div style={{ marginTop: '30px', borderTop: '1px solid #1f2330', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: '#717585', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
              📦 DISTRIBUTED LEDGER STATE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', background: '#00ff66', borderRadius: '50%', display: 'inline-block' }}></span>
              <span style={{ color: '#00ff66', fontSize: '11px', fontWeight: '600' }}>CONNECTED</span>
            </div>
          </div>
          
          {/* Teks Kode Tetap Memakai Monospace Agar Rapi Struktur Objeknya */}
          <pre style={{
            fontFamily: "'Fira Code', 'Courier New', monospace",
            background: '#07080c', padding: '14px', borderRadius: '8px',
            fontSize: '11.5px', overflowX: 'auto', maxHeight: '120px',
            color: '#a3a7b6', border: '1px solid #14161f', margin: 0
          }}>
            {Object.keys(blockchainLedger).length === 0 
              ? '// Belum ada node terdaftar di jaringan.' 
              : JSON.stringify(blockchainLedger, null, 2)
            }
          </pre>
        </div>

      </div>
    </div>
  );
}