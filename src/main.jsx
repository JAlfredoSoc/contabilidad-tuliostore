import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <App />
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: 'store-toast',
            title: 'store-toast-title',
            description: 'store-toast-description'
          }
        }}
      />
    </>
  </StrictMode>,
)
