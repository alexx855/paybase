import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'
import { baseSepolia } from 'wagmi/chains'

export default defineConfig({
  out: 'src/generated.ts',
  plugins: [
    foundry({
      project: './',
      forge: {
        clean: true,
        build: true,
        rebuild: true,
      },
      deployments: {
        Counter: {
          [baseSepolia.id]: '0x0d4674943DF784431733F7B6Cfae6F5df5deaEC0',
        },
      },
    }),
  ],
})
