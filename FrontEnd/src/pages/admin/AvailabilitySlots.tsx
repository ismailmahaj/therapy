import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AvailabilitySlot } from '../../types';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import Button from '../../components/Button';

const AvailabilitySlots = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    gender: 'homme' as 'homme' | 'femme',
    max_appointments: 1,
  });
  const [filters, setFilters] = useState({
    date: '',
    gender: '' as '' | 'homme' | 'femme',
  });

  useEffect(() => {
    loadSlots();
  }, [filters]);

  const loadSlots = async () => {
    try {
      const params: any = {};
      if (filters.date) params.date = filters.date;
      if (filters.gender) params.gender = filters.gender;
      
      const data = await adminService.getAvailabilitySlots(params);
      setSlots(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des créneaux');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await adminService.createAvailabilitySlot(formData);
      setFormData({
        date: '',
        start_time: '',
        end_time: '',
        gender: 'homme',
        max_appointments: 1,
      });
      setShowForm(false);
      loadSlots();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du créneau');
    }
  };

  const handleToggleAvailability = async (slot: AvailabilitySlot) => {
    try {
      await adminService.updateAvailabilitySlot(slot.id, {
        is_available: !slot.is_available,
      });
      loadSlots();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      return;
    }

    try {
      await adminService.deleteAvailabilitySlot(id);
      loadSlots();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) return <Loading />;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Créneaux</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : 'Ajouter un créneau'}
        </Button>
      </div>

      {error && <Error message={error} />}

      {/* Filtres */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtres</h2>
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
            <label className="label">Sexe</label>
            <select
              className="input"
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value as any })}
            >
              <option value="">Tous</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Nouveau Créneau</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Sexe</label>
                <select
                  required
                  className="input"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                >
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </select>
              </div>
              <div>
                <label className="label">Heure de début</label>
                <input
                  type="time"
                  required
                  className="input"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Heure de fin</label>
                <input
                  type="time"
                  required
                  className="input"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Nombre maximum de rendez-vous</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="input"
                  value={formData.max_appointments}
                  onChange={(e) => setFormData({ ...formData, max_appointments: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Créer le créneau
            </Button>
          </form>
        </div>
      )}

      {/* Liste des créneaux */}
      {slots.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Aucun créneau disponible</p>
        </div>
      ) : (
        <div className="space-y-4">
          {slots.map((slot) => (
            <div key={slot.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatDate(slot.date)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      slot.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {slot.is_available ? 'Disponible' : 'Indisponible'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {slot.gender === 'homme' ? 'Homme' : 'Femme'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Heure:</span> {slot.start_time} - {slot.end_time}
                    </div>
                    <div>
                      <span className="font-medium">Rendez-vous:</span> {slot.current_appointments} / {slot.max_appointments}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant={slot.is_available ? 'secondary' : 'primary'}
                    onClick={() => handleToggleAvailability(slot)}
                  >
                    {slot.is_available ? 'Désactiver' : 'Activer'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(slot.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailabilitySlots;
