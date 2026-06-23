import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// ── Dynamic API base URL ───────────────────────────────────────────────────
// Reads VITE_API_URL from .env.local if set (written by start.ps1).
// Falls back to using the current browser's hostname so phones on the same
// Wi-Fi automatically hit the right backend without any manual config.
const _envUrl = import.meta.env.VITE_API_URL;
const _host   = window.location.hostname;          // e.g. 192.168.1.42
export const API_BASE_URL = _envUrl || `http://${_host}:8000`;

// Set up Axios default configurations
axios.defaults.baseURL = API_BASE_URL;


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Web3 States
  const [walletAddress, setWalletAddress] = useState(localStorage.getItem('walletAddress') || null);
  const [usdcBalance, setUsdcBalance] = useState(localStorage.getItem('usdcBalance') || '100.00');
  const [isWeb3User, setIsWeb3User] = useState(localStorage.getItem('isWeb3User') === 'true');

  // Configure Axios token header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      fetchCurrentUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Keep USDC balance updated if wallet is connected
  useEffect(() => {
    if (walletAddress) {
      fetchUsdcBalance(walletAddress);
      // Poll every 30 seconds
      const interval = setInterval(() => fetchUsdcBalance(walletAddress), 30000);
      return () => clearInterval(interval);
    }
  }, [walletAddress]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/auth/me');
      setUser(response.data);
      // If user has a wallet address set, keep it synchronized
      if (response.data.wallet_address && !walletAddress) {
        setWalletAddress(response.data.wallet_address);
        setIsWeb3User(true);
        localStorage.setItem('walletAddress', response.data.wallet_address);
        localStorage.setItem('isWeb3User', 'true');
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchUsdcBalance = async (address) => {
    if (!address) return;
    try {
      const usdcContract = "0x5425890298aed601595a70ab815c96711a31bc65";
      // selector for balanceOf(address) is 0x70a08231
      const cleanAddress = address.replace('0x', '').toLowerCase().padStart(64, '0');
      const data = '0x70a08231' + cleanAddress;
      
      const response = await fetch("https://api.avax-test.network/ext/bc/C/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: usdcContract, data: data }, "latest"],
          id: 1
        })
      });
      const resData = await response.json();
      if (resData.result && resData.result !== '0x') {
        const rawBalance = parseInt(resData.result, 16);
        const formatted = (rawBalance / 1000000).toFixed(2);
        setUsdcBalance(formatted);
        localStorage.setItem('usdcBalance', formatted);
      } else {
        setUsdcBalance('100.00');
      }
    } catch (e) {
      console.log("Error querying Fuji RPC for USDC balance:", e);
      setUsdcBalance('100.00'); // default sandbox balance
    }
  };

  const connectWallet = async (simulatedEmail = null) => {
    try {
      if (simulatedEmail) {
        // Thirdweb Embedded Wallet Simulation (Email/Social Login)
        const hash = simulatedEmail.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const mockAddress = `0x38b2${hash.toString(16).padEnd(36, 'f')}`;
        setWalletAddress(mockAddress);
        setIsWeb3User(true);
        localStorage.setItem('walletAddress', mockAddress);
        localStorage.setItem('isWeb3User', 'true');
        fetchUsdcBalance(mockAddress);
        return { success: true, address: mockAddress, type: 'embedded' };
      }
      
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setWalletAddress(address);
        setIsWeb3User(true);
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('isWeb3User', 'true');
        
        // Auto-switch to Avalanche Fuji Testnet (Chain ID 43113 = 0xa869)
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xa869' }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xa869',
                chainName: 'Avalanche Fuji Testnet',
                nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
                rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://testnet.snowtrace.io/']
              }]
            });
          }
        }
        
        fetchUsdcBalance(address);
        return { success: true, address, type: 'metamask' };
      } else {
        return { success: false, error: 'No Web3 wallet extension found. Try Embedded Wallet via email.' };
      }
    } catch (e) {
      console.error("Wallet connection failed:", e);
      return { success: false, error: e.message };
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsWeb3User(false);
    setUsdcBalance('100.00');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('isWeb3User');
    localStorage.removeItem('usdcBalance');
    logout();
  };

  const getNonceChallenge = async (address) => {
    const response = await axios.get(`/auth/nonce?wallet_address=${address}`);
    return response.data;
  };

  const signMessage = async (messageText, address, type) => {
    if (type === 'embedded' || !window.ethereum) {
      return `mock_sig_${address}_${Date.now()}`;
    }
    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [messageText, address],
      });
      return signature;
    } catch (e) {
      console.error("Personal sign failed:", e);
      throw e;
    }
  };

  const web3Login = async (address, type = 'metamask', email = null) => {
    try {
      const challenge = await getNonceChallenge(address);
      const signature = await signMessage(challenge.message, address, type);
      
      const payload = {
        wallet_address: address,
        signature: signature
      };
      if (email) {
        payload.email = email;
      }
      
      const response = await axios.post('/auth/web3-login', payload);
      
      setToken(response.data.access_token);
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Web3 Login failed.';
      return { success: false, error: errMsg };
    }
  };

  const web3Register = async (address, registerData, type = 'metamask', email = null) => {
    try {
      const challenge = await getNonceChallenge(address);
      const signature = await signMessage(challenge.message, address, type);
      
      const payload = {
        wallet_address: address,
        signature: signature,
        name: registerData.name,
        role: registerData.role,
        location: registerData.location
      };
      if (email) {
        payload.email = email;
      }
      
      const response = await axios.post('/auth/web3-login', payload);
      
      setToken(response.data.access_token);
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Web3 Registration failed.';
      return { success: false, error: errMsg };
    }
  };

  const login = async (email, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      setToken(response.data.access_token);
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Login failed. Please check credentials.';
      return { success: false, error: errMsg };
    }
  };

  const register = async (userData) => {
    try {
      await axios.post('/auth/register', userData);
      return await login(userData.email, userData.password);
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Registration failed. Email might already be taken.';
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setWalletAddress(null);
    setIsWeb3User(false);
    localStorage.removeItem('token');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('isWeb3User');
    localStorage.removeItem('usdcBalance');
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      walletAddress, 
      usdcBalance, 
      isWeb3User,
      connectWallet, 
      disconnectWallet, 
      web3Login, 
      web3Register, 
      login, 
      register, 
      logout, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
