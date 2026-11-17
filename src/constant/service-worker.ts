export function registerServiceWorker(): void {
  if (process.env.NODE_ENV !== 'production') return // em dev o SW cacheia módulos do Vite e congela tree antiga
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('SW registered: ', registration.scope)
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}
