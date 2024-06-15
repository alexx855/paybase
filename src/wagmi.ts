import { http, createConfig } from 'wagmi'
import { base, baseSepolia, foundry } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({ appName: 'Create Wagmi' }),
  ],
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [foundry.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
