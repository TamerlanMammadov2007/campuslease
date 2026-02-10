type PayPalOrder = {
  id?: string
}

type PayPalButtonsActions = {
  order: {
    create: (payload: {
      intent: "CAPTURE"
      purchase_units: Array<{
        amount: {
          currency_code: string
          value: string
        }
        description?: string
      }>
    }) => Promise<string>
    capture: () => Promise<PayPalOrder>
  }
}

type PayPalButtonsOptions = {
  createOrder: (data: unknown, actions: PayPalButtonsActions) => Promise<string>
  onApprove: (
    data: { orderID?: string },
    actions: PayPalButtonsActions,
  ) => Promise<void>
  onError?: (error: unknown) => void
  fundingSource?: string
}

type PayPalButtonsInstance = {
  render: (container: HTMLElement | string) => Promise<void>
  close: () => void
}

type PayPalNamespace = {
  Buttons: (options: PayPalButtonsOptions) => PayPalButtonsInstance
  FUNDING: {
    PAYPAL: string
    CARD: string
  }
}

declare global {
  interface Window {
    paypal?: PayPalNamespace
  }
}

export {}
