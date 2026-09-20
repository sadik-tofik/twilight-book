'use client';

import React, { useMemo, useCallback, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { DEFAULT_RPC_URL } from '@/lib/solanaConfig';

// Import wallet adapter UI default styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface Props {
  children: ReactNode;
}

export const SolanaWalletProvider: React.FC<Props> = ({ children }) => {
  const endpoint = useMemo(() => DEFAULT_RPC_URL, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  const handleError = useCallback((error: WalletError) => {
    // Expected user rejection or cancellation shouldn't trigger Next.js dev overlay
    if (
      error.name === 'WalletSignTransactionError' ||
      error.message?.includes('User rejected') ||
      error.message?.includes('User cancelled')
    ) {
      console.warn('Wallet transaction rejected by user:', error.message);
      return;
    }
    console.error('Wallet error:', error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={handleError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
