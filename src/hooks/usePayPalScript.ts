import * as React from "react"

type PayPalScriptState = {
  isReady: boolean
  error?: string
}

export function usePayPalScript(clientId: string | undefined, currency = "USD") {
  const [state, setState] = React.useState<PayPalScriptState>({
    isReady: false,
  })

  React.useEffect(() => {
    if (!clientId) {
      setState({ isReady: false, error: "Missing PayPal client ID." })
      return
    }

    if (window.paypal) {
      setState({ isReady: true })
      return
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-paypal-sdk="true"]',
    )

    if (existing) {
      existing.addEventListener("load", () => setState({ isReady: true }))
      existing.addEventListener("error", () =>
        setState({ isReady: false, error: "Failed to load PayPal SDK." }),
      )
      return
    }

    const script = document.createElement("script")
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&components=buttons&enable-funding=card`
    script.async = true
    script.dataset.paypalSdk = "true"
    script.onload = () => setState({ isReady: true })
    script.onerror = () =>
      setState({ isReady: false, error: "Failed to load PayPal SDK." })
    document.body.appendChild(script)
  }, [clientId, currency])

  return state
}
