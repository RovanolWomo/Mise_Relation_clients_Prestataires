import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider } from '@/i18n/I18nContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LandingPage } from '@/pages/Landing/LandingPage'
import { AuthPage } from '@/pages/Auth/AuthPage'
import { RegisterPrestatairePage } from '@/pages/Auth/RegisterPrestatairePage'
import { ParticulierDashboard } from '@/pages/Particulier/ParticulierDashboard'
import { NouvelleDemandePage } from '@/pages/Particulier/NouvelleDemandePage'
import { PrestataireDashboard } from '@/pages/Prestataire/PrestataireDashboard'
import { NouvellePrestation } from '@/pages/Prestataire/NouvellePrestation'
import { AdminDashboard } from '@/pages/Admin/AdminDashboard'
import { ServicesPage } from '@/pages/Services/ServicesPage'
import { ServiceDetailPage } from '@/pages/Services/ServiceDetailPage'
import { PrestatairesPage } from '@/pages/Prestataires/PrestatairesPage'
import { PrestataireProfil } from '@/pages/Prestataires/PrestataireProfil'

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
        <Route path="/services/:id" element={<PublicLayout><ServiceDetailPage /></PublicLayout>} />
        <Route path="/prestataires" element={<PublicLayout><PrestatairesPage /></PublicLayout>} />
        <Route path="/prestataires/:id" element={<PublicLayout><PrestataireProfil /></PublicLayout>} />

        {/* Auth */}
        <Route path="/connexion" element={<AuthPage mode="login" />} />
        <Route path="/inscription" element={<AuthPage mode="register" />} />
        <Route path="/inscription/prestataire" element={<RegisterPrestatairePage />} />

        {/* Particulier */}
        <Route path="/particulier" element={<ParticulierDashboard />} />
        <Route path="/particulier/nouvelle-demande" element={<NouvelleDemandePage />} />

        {/* Prestataire */}
        <Route path="/prestataire" element={<PrestataireDashboard />} />
        <Route path="/prestataire/nouvelle-prestation" element={<NouvellePrestation />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppRoutes />
      </I18nProvider>
    </ThemeProvider>
  )
}
