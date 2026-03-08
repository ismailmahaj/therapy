import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Vérifier les rôles : d'abord via roles[], puis via role
  const hasRole = (roleSlug: string): boolean => {
    if (!user) return false;
    // Vérifier dans le tableau roles (many-to-many)
    if (user.roles && user.roles.includes(roleSlug)) return true;
    // Vérifier dans le champ role (compatibilité)
    return user.role === roleSlug;
  };

  const isTherapyUser = hasRole('therapy') || hasRole('admin') || hasRole('superadmin');
  const isClient = hasRole('client') || (user?.role === 'user' && !isTherapyUser);

  // Fonction pour obtenir le libellé du rôle
  const getUserRoleLabel = (): string => {
    if (!user) return '';
    
    // Vérifier les rôles dans l'ordre de priorité
    if (hasRole('superadmin')) return 'Super Admin';
    if (hasRole('admin')) return 'Admin';
    if (hasRole('therapy')) return 'Thérapeute';
    if (hasRole('donation')) return 'Gestionnaire Donations';
    if (hasRole('client')) return 'Client';
    
    // Fallback sur le champ role
    if (user.role === 'superadmin') return 'Super Admin';
    if (user.role === 'admin') return 'Admin';
    if (user.role === 'therapy') return 'Thérapeute';
    if (user.role === 'donation') return 'Gestionnaire Donations';
    if (user.role === 'user' || user.role === 'client') return 'Client';
    
    return 'Utilisateur';
  };

  // Fonction pour obtenir la couleur du badge selon le rôle
  const getRoleBadgeColor = (): string => {
    if (!user) return 'bg-gray-100 text-gray-800';
    
    if (hasRole('superadmin') || user.role === 'superadmin') return 'bg-purple-100 text-purple-800';
    if (hasRole('admin') || user.role === 'admin') return 'bg-red-100 text-red-800';
    if (hasRole('therapy') || user.role === 'therapy') return 'bg-blue-100 text-blue-800';
    if (hasRole('donation') || user.role === 'donation') return 'bg-green-100 text-green-800';
    
    return 'bg-gray-100 text-gray-800';
  };

  const isDonationUser = hasRole('donation') || hasRole('admin') || hasRole('superadmin');

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    // Menu pour les thérapeutes
    ...(isTherapyUser ? [
      { name: 'Mon Profil Thérapeute', path: '/therapy/profile', icon: '👤' },
      { name: 'Calendrier', path: '/therapy/calendar', icon: '📅' },
      { name: 'Mes Créneaux', path: '/therapy/slots', icon: '📋' },
      { name: 'Disponibilités', path: '/therapy/availability', icon: '⏰' },
      { name: 'Mes Rendez-vous', path: '/therapy/appointments', icon: '📝' },
    ] : []),
    // Menu pour les clients
    ...(isClient ? [
      { name: 'Mon Profil', path: '/profile', icon: '👤' },
      { name: 'Calendrier', path: '/appointments/calendar', icon: '📅' },
      { name: 'Mes Rendez-vous', path: '/appointments', icon: '📋' },
      { name: 'Prendre RDV', path: '/appointments/new', icon: '➕' },
      { name: 'Donations', path: '/donations', icon: '💚' },
    ] : []),
    // Menu pour les gestionnaires de donations
    ...(isDonationUser ? [
      { name: 'Mon Profil', path: '/donation/profile', icon: '👤' },
      { name: 'Mes Projets', path: '/donation/projects', icon: '💚' },
    ] : []),
    // Menu admin
    ...(user?.role === 'admin' || user?.role === 'superadmin' ? [
      { name: 'Admin - Créneaux', path: '/admin/availability-slots', icon: '⚙️' },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo + Menu button mobile */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">Therapy Center</h1>
            </div>
            
            {/* User info + Logout */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-xs text-gray-500 hidden md:block truncate max-w-[150px]">
                    {user?.email}
                  </div>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor()}`}>
                  {getUserRoleLabel()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <span className="hidden sm:inline">Déconnexion</span>
                <span className="sm:hidden">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Sidebar - Desktop (toujours visible sur lg+) */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Sidebar - Mobile (Overlay, caché par défaut) */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg z-50 lg:hidden overflow-y-auto">
              <nav className="p-4">
                <ul className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>
          </>
        )}

        {/* Main Content - Prend toute la largeur sur mobile quand sidebar fermé */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0 lg:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
