import React, { createContext, useContext, useState, useEffect } from 'react';

type Route = 'home' | 'apply' | 'admin' | 'login' | 'my_application';

interface NavigationContextType {
  currentRoute: Route;
  navigate: (route: Route) => void;
  isAdminRoute: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getRouteFromUrl = (): Route => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.includes('/admin') || hash === '#admin') {
      return 'admin';
    }
    if (path.includes('/my-application')) return 'my_application';
    if (path.includes('/login')) return 'login';
    if (path.includes('/apply') || hash === '#apply') {
      return 'apply';
    }
    return 'home';
  };

  const [currentRoute, setCurrentRoute] = useState<Route>(getRouteFromUrl);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getRouteFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (route: Route) => {
    setCurrentRoute(route);
    let targetPath = '/';
    if (route === 'admin') targetPath = '/admin';
    else if (route === 'login') targetPath = '/login';
    else if (route === 'my_application') targetPath = '/my-application';
    else if (route === 'apply') targetPath = '/#apply';

    try {
      window.history.pushState(null, '', targetPath);
    } catch {
      // fallback in sandbox if pushState is restricted
      window.location.hash = route === 'admin' ? 'admin' : (route === 'apply' ? 'apply' : '');
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        currentRoute,
        navigate,
        isAdminRoute: currentRoute === 'admin',
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
