import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { HelmetProvider } from "react-helmet-async"

import "./index.css"
import App from "./App"
import { AppProvider } from "@/context/AppContext"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <App />
          <Toaster richColors position="top-center" />
        </AppProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)
