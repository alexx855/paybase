'use client'

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'

function Account() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { chains, switchChain, isPending } = useSwitchChain();
  return (
    <>

        <h2>Account</h2>

        <div>
        status: {account.status}

        {account.status === 'connected' && (
          <div>
            <span>addresses: {JSON.stringify(account.addresses)}</span>
            <br />
            <span> chainId: {account.chainId}</span>
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
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
    </>
  )
}

export default Account
