import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AdminPage } from './pages/AdminPage';

const AppContent: React.FC = () => {
  const { currentRoute } = useNavigation();

  return (
    <div className={currentRoute === 'admin' ? 'admin-shell' : 'public-shell'}>
      <Navbar />
      <main id="main-content">
        {currentRoute === 'admin' ? <AdminPage /> : <LandingPage />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
