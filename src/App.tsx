import { AuthGate } from './auth/AuthGate'
import { ThemeSync } from './components/brand/ThemeSync'

export default function App() {
  return (
    <>
      <ThemeSync />
      <AuthGate />
    </>
  )
}
