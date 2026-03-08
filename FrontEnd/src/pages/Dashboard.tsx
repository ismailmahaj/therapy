import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';
import type { Appointment } from '../types';
import Loading from '../components/Loading';
import Error from '../components/Error';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [totalDonations, setTotalDonations] = useState('0.00');
  
  // Vérifier les rôles : d'abord via roles[], puis via role
  const hasRole = (roleSlug: string): boolean => {
    if (!user) return false;
    if (user.roles && user.roles.includes(roleSlug)) return true;
    return user.role === roleSlug;
  };
  
  const isTherapyUser = hasRole('therapy') || hasRole('admin') || hasRole('superadmin');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await dashboardService.getOverview();
      setUpcomingAppointments(data.upcoming_appointments);
      setTotalDonations(data.total_donations);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const formatDate = (slot: Appointment['slot']) => {
    if (!slot) return 'Date non disponible';
    const date = new Date(`${slot.date}T${slot.start_time}`);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      confirmed: 'Confirmé',
      pending: 'En attente',
      cancelled: 'Annulé',
      completed: 'Terminé',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">Dashboard</h1>

      {error && <Error message={error} onRetry={loadData} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Card: Prochains RDV */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Prochains Rendez-vous</h2>
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500">Aucun rendez-vous à venir</p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="border-l-4 border-primary-500 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(appointment.slot)}
                      </p>
                      {appointment.therapist && (
                        <p className="text-sm text-gray-600">
                          Avec {appointment.therapist.first_name} {appointment.therapist.last_name}
                        </p>
                      )}
                      {appointment.slot && (
                        <p className="text-sm text-gray-600">
                          {appointment.slot.location || 'Lieu à confirmer'}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(appointment.statut)}`}>
                      {getStatusLabel(appointment.statut)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/appointments" className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-medium">
            Voir tous les rendez-vous →
          </Link>
        </div>

        {/* Card: Donations */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Vos Donations</h2>
          <div className="text-center py-8">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
              {parseFloat(totalDonations).toFixed(2)} €
            </p>
            <p className="text-gray-600">Total des donations</p>
          </div>
          <Link to="/donations" className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-medium">
            Voir mes donations →
          </Link>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="card">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          {isTherapyUser ? (
            <>
              <Link
                to="/therapy/slots"
                className="btn-primary"
              >
                Gérer mes créneaux
              </Link>
              <Link
                to="/therapy/availability"
                className="btn-secondary"
              >
                Disponibilités récurrentes
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/appointments/new"
                className="btn-primary"
              >
                Prendre un rendez-vous
              </Link>
              <Link
                to="/donations"
                className="btn-secondary"
              >
                Faire une donation
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
