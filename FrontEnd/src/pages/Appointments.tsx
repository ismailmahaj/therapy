import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { appointmentService } from '../services/appointmentService';
import type { Appointment } from '../types';
import Loading from '../components/Loading';
import Error from '../components/Error';
import Button from '../components/Button';

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Rediriger les thérapeutes vers leur page dédiée
  useEffect(() => {
    if (user) {
      const hasRole = (roleSlug: string): boolean => {
        if (user.roles && user.roles.includes(roleSlug)) return true;
        return user.role === roleSlug;
      };
      
      if (hasRole('therapy') || hasRole('admin') || hasRole('superadmin')) {
        navigate('/therapy/appointments', { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    try {
      await appointmentService.cancel(id);
      loadAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l\'annulation');
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Rendez-vous</h1>
        <Link to="/appointments/new">
          <Button>Prendre un rendez-vous</Button>
        </Link>
      </div>

      {error && <Error message={error} onRetry={loadAppointments} />}

      {appointments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Aucun rendez-vous</p>
          <Link to="/appointments/new">
            <Button>Prendre un rendez-vous</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatDate(appointment.slot)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(appointment.statut)}`}>
                      {getStatusLabel(appointment.statut)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    {appointment.therapist && (
                      <div>
                        <span className="font-medium">Thérapeute:</span>{' '}
                        {appointment.therapist.first_name} {appointment.therapist.last_name}
                      </div>
                    )}
                    {appointment.slot && (
                      <>
                        <div>
                          <span className="font-medium">Lieu:</span>{' '}
                          {appointment.slot.location || 'À confirmer'}
                        </div>
                        <div>
                          <span className="font-medium">Prix:</span>{' '}
                          {appointment.slot.price ? `${parseFloat(appointment.slot.price).toFixed(2)} €` : 'N/A'}
                        </div>
                      </>
                    )}
                  </div>
                  {appointment.payment && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Acompte:</span>{' '}
                      <span className={appointment.payment.status === 'succeeded' ? 'text-green-600' : 'text-yellow-600'}>
                        {appointment.payment.status === 'succeeded' ? 'Payé' : 'En attente'}
                      </span>
                    </div>
                  )}
                  {appointment.client_notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {appointment.client_notes}
                    </div>
                  )}
                </div>
                {appointment.statut !== 'cancelled' && appointment.statut !== 'completed' && (
                  <Button
                    variant="danger"
                    onClick={() => handleCancel(appointment.id)}
                    className="ml-4"
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
