"use client";

import React, { useEffect, useState } from "react";

function Refill({ address }: { address: `0x${string}` }) {
  const [clientSecret, setClientSecret] = useState("");

  const onClick = async () => {
    const resp = await fetch("/api/create-onramp-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet_addresses: address,
        destination_exchange_amount: "1.37",
        destination_network: "baseSepolia",
      }),
    });
    if (resp.ok) {
      const json = await resp.json();
      setClientSecret(json.clientSecret);
    }
  };

  useEffect(() => {
    if (!clientSecret) {
      return;
    }

    // Dynamically load the StripeJS script
    const loadStripeJS = () => {
      return new Promise<void>((resolve, reject) => {
        const stripeJSScript = document.createElement('script');
        stripeJSScript.src = 'https://js.stripe.com/v3/';
        stripeJSScript.onload = () => resolve();
        stripeJSScript.onerror = () => reject('StripeJS failed to load');
        document.body.appendChild(stripeJSScript);
      });
    };

    // Dynamically load the Stripe onramp script
    const loadOnrampScript = () => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://crypto-js.stripe.com/crypto-onramp-outer.js';
        script.onload = () => resolve();
        script.onerror = () => reject('Stripe Crypto Onramp failed to load');
        document.body.appendChild(script);
      });
    };


    // Load StripeJS, then load the Crypto Onramp script
    loadStripeJS().then(() => {
      loadOnrampScript().then(() => {
        // Ensure the StripeOnramp is available in the window object
        if ((window as any).StripeOnramp) {
          const stripeOnramp = (window as any).StripeOnramp(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
          const onrampSession = stripeOnramp.createSession({ clientSecret });
          onrampSession.mount("#onramp-element");
        }
      }).catch(error => console.error(error));
    }).catch(error => console.error(error));

    // Cleanup function to remove the scripts
    return () => {
      document.querySelectorAll('script[src^="https://js.stripe.com"], script[src^="https://crypto-js.stripe.com"]').forEach(script => {
        document.body.removeChild(script);
      });
    };
  }, [clientSecret]);

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw 'Did you forget to add a ".env.local" file?';
  }

  return (
    <div>
      {!clientSecret ? (
        <button
          onClick={onClick}
          disabled={!address}
        >
          Refill balance with Stripe
        </button>
      ) : (
        <>
          <div id="onramp-message"></div>
          <div id="onramp-element"></div>
        </>
      )}
    </div>
  );
}


export default Refill