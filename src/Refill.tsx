"use client";

import React, { useEffect, useState } from "react";

function Refill({ address }: { address: `0x${string}` }) {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    const fetchClientSecret = async () => {
      if (!address) return;

      const resp = await fetch("/api/create-onramp-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_addresses: address,
          destination_network: "base",
        }),
      });
      if (resp.ok) {
        const json = await resp.json();
        setClientSecret(json.clientSecret);
      }
    };

    fetchClientSecret();
  }, [address]);

  useEffect(() => {
    if (!clientSecret) {
      return;
    }

    const loadStripeJS = () => {
      return new Promise<void>((resolve, reject) => {
        if (!document.querySelector('script[src="https://js.stripe.com/v3/"]')) {
          const stripeJSScript = document.createElement('script');
          stripeJSScript.src = 'https://js.stripe.com/v3/';
          stripeJSScript.onload = () => resolve();
          stripeJSScript.onerror = () => reject('StripeJS failed to load');
          document.body.appendChild(stripeJSScript);
        } else {
          reject("StripeJS already loaded");
        }
      });
    };

    const loadOnrampScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (!document.querySelector('script[src="https://crypto-js.stripe.com/crypto-onramp-outer.js"]')) {
          const script = document.createElement('script');
          script.src = 'https://crypto-js.stripe.com/crypto-onramp-outer.js';
          script.onload = () => resolve();
          script.onerror = () => reject('Stripe Crypto Onramp failed to load');
          document.body.appendChild(script);
        } else {
          reject("Onramp script already loaded");
        }
      });
    };

    loadStripeJS().then(() => {
      loadOnrampScript().then(() => {
        if ((window as any).StripeOnramp) {
          const stripeOnramp = (window as any).StripeOnramp(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
          const onrampSession = stripeOnramp.createSession({ clientSecret });
          onrampSession.mount("#onramp-element");
        }
      }).catch(error => console.error(error));
    }).catch(error => console.error(error));

  }, [clientSecret]);

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw 'Did you forget to add a ".env.local" file?';
  }

  return (
    <div>
      {!clientSecret ? (
        <div>Loading...</div> // Placeholder content while waiting for clientSecret
      ) : (
        <>
          <div id="onramp-message"></div>
          <div id="onramp-element"></div>
        </>
      )}
    </div>
  );
}

export default Refill;