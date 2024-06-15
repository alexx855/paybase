"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React, { useState } from "react";
import CreditCardForm from "./CreditCardForm";
import { useAccount, type BaseError, useReadContract, useWriteContract, useWatchContractEvent, useWaitForTransactionReceipt } from 'wagmi'
import { counterConfig } from "./generated";
import { baseSepolia } from 'wagmi/chains'

function Checkout() {
  const { address } = useAccount()
  const {
    data: number,
    error,
    isPending
  } = useReadContract({
    abi: counterConfig.abi,
    chainId: baseSepolia.id,
    address: counterConfig.address[baseSepolia.id],
    functionName: 'number',
  })
  const { data: hash, writeContract } = useWriteContract()
  const [clientSecret, setClientSecret] = useState("");
  const account = useAccount()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  useWatchContractEvent({
    address: counterConfig.address[baseSepolia.id],
    abi: counterConfig.abi,
    chainId: baseSepolia.id,
    eventName: 'NumberChanged',
    onLogs(logs) {
      console.log('New logs!', logs)
    },
    poll: true
  })

  const onClick = async () => {
    const resp = await fetch("/api/stripe-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerWalletAddress: address,
      }),
    });
    if (resp.ok) {
      const json = await resp.json();
      setClientSecret(json.clientSecret);
    }
  };

  const handleIncrement = async () => {
    if (!account.addresses) throw 'No address'
    if (account.chainId !== baseSepolia.id) throw 'Wrong chain'
    writeContract({
      abi: counterConfig.abi,
      chainId: baseSepolia.id,
      address: counterConfig.address[baseSepolia.id],
      functionName: 'increment',
    })
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw 'Did you forget to add a ".env.local" file?';
  }
  const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  if (isPending) return <div>Loading...</div>

  return (
    <div>

      {error && (
        <div>
          Error: {(error as unknown as BaseError).shortMessage || error.message}
        </div>
      )}

      <div>number: {number?.toString()} <button onClick={handleIncrement}>Increment</button></div>
      <div>{address}</div>
      {hash && (<div>Transaction Hash: {hash}</div>)}
      {isConfirming && (<div>Waiting for confirmation...</div>)}
      {isConfirmed && (<div>Transaction Confirmed!</div>)}
      {!clientSecret ? (
        <button
          onClick={onClick}
          disabled={!address}
        >
          Buy with credit card
        </button>
      ) : (
        <Elements
          options={{
              clientSecret,
              appearance: { theme: "flat" },
          }}
          stripe={stripe}
        >
          <CreditCardForm />
        </Elements>
      )}

    </div>

  );
}


export default Checkout