import { Routes, Route } from "react-router-dom"
import { Navbar } from "./components/layout/navbar"
import { Toaster } from "./components/ui/toaster"
import HomePage from "./pages/HomePage"
import TradePage from "./pages/TradePage"
import AlertsPage from "./pages/AlertsPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import SettingsPage from "./pages/SettingsPage"

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trade" element={<TradePage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  )
}

export default App
