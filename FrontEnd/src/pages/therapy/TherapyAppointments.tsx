import { useEffect, useState } from 'react';
import { therapyService } from '../../services/therapyService';
import type { Appointment } from '../../types';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import Button from '../../components/Button';

const TherapyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    statut: '',
    date: '',
  });

  useEffect(() => {
    loadAppointments();
  }, [filters]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.statut) params.statut = filters.statut;
      if (filters.date) params.date = filters.date;
      
      const data = await therapyService.getAppointments(params);
      setAppointments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    if (!confirm('Marquer ce rendez-vous comme terminé ?')) {
      return;
    }

    try {
      await therapyService.completeAppointment(id);
      loadAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour');
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
        <h1 className="text-3xl font-bold text-gray-900">Mes Rendez-vous Reçus</h1>
      </div>

      {error && <Error message={error} onRetry={loadAppointments} />}

      {/* Filtres */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Statut</label>
            <select
              className="input"
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Aucun rendez-vous reçu</p>
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
                    {appointment.client && (
                      <div>
                        <span className="font-medium">Client:</span>{' '}
                        {appointment.client.first_name} {appointment.client.last_name}
                      </div>
                    )}
                    {appointment.slot && (
                      <>
                        <div>
                          <span className="font-medium">Lieu:</span>{' '}
                          {appointment.slot.location || 'À confirmer'}
                        </div>
                        {appointment.slot.price && (
                          <div>
                            <span className="font-medium">Prix:</span>{' '}
                            {parseFloat(appointment.slot.price).toFixed(2)} €
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {appointment.client_notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Notes client:</span> {appointment.client_notes}
                    </div>
                  )}
                  {appointment.therapist_notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Mes notes:</span> {appointment.therapist_notes}
                    </div>
                  )}
                </div>
                {appointment.statut === 'confirmed' && (
                  <Button
                    variant="secondary"
                    onClick={() => handleComplete(appointment.id)}
                    className="ml-4"
                  >
                    Marquer terminé
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

export default TherapyAppointments;
