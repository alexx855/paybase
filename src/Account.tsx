'use client'

import { useAccount, useBalance, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { formatEther } from 'viem'
import Link from 'next/link'

function Account() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { chains, switchChain, isPending } = useSwitchChain();
  const { data, } = useBalance({
    address: account.address,
  })

  return (
    <>
      {account.status === 'connected' ? (
        <div>
          <h1>Refill <Link href={`/refill/${account.address}`}>{account.address}</Link></h1>
          {data && <h2>Your balance is: {formatEther(data.value)}</h2>}
            {chains.map((chain) => {
              if (chain.id === account.chainId) {
                return (
                  <button className="p-2 text-left" key={chain.id} disabled>
                    {chain.name} (active)
                  </button>
                );
              } else {
                return (
                  <button
                    className="p-2 text-left"
                    key={chain.id}
                    onClick={() => switchChain({ chainId: chain.id })}
                  >
                    Switch to {chain.name}
                    {isPending && " (switching)"}
                  </button>
                );
              }
            })}
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
          </div>
      ) : (
        <div>
            <h1>Please connect your wallet:</h1>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                type="button"
              >
                {connector.name}
              </button>
            ))}
          </div>
      )}
    </>
  )
}

export default Account
