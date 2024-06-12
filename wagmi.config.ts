import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'
import { base, baseSepolia, foundry as foundryChain } from 'wagmi/chains'

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [],
  plugins: [
    foundry({
      project: './',
      forge: {
        clean: true,
        build: true,
        rebuild: true,
      },
      deployments: {
        [base.id]: '0x6c6077c383b80fB8EaAEcbB0421B6a90958f0CCf',
        [baseSepolia.id]: '0x6c6077c383b80fB8EaAEcbB0421B6a90958f0CCf',
        [foundryChain.id]: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      },
    }),
  ],
})
