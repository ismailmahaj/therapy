import { useEffect, useState } from 'react';
import { therapyService } from '../../services/therapyService';
import type { RecurringAvailability, CreateRecurringAvailabilityData } from '../../services/therapyService';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import Button from '../../components/Button';

const RecurringAvailabilityPage = () => {
  const [availabilities, setAvailabilities] = useState<RecurringAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateRecurringAvailabilityData>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '18:00',
    slot_duration_minutes: 60,
    max_clients_per_slot: 1,
    price_per_slot: undefined,
    valid_from: '',
    valid_until: '',
  });

  useEffect(() => {
    loadAvailabilities();
  }, []);

  const loadAvailabilities = async () => {
    try {
      setLoading(true);
      const data = await therapyService.getRecurringAvailabilities();
      setAvailabilities(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await therapyService.createRecurringAvailability(formData);
      setFormData({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '18:00',
        slot_duration_minutes: 60,
        max_clients_per_slot: 1,
        price_per_slot: undefined,
        valid_from: '',
        valid_until: '',
      });
      setShowForm(false);
      loadAvailabilities();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité récurrente ?')) {
      return;
    }

    const deleteFuture = confirm('Supprimer aussi les créneaux futurs générés à partir de cette disponibilité ?');

    try {
      await therapyService.deleteRecurringAvailability(id, deleteFuture);
      loadAvailabilities();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleGenerateSlots = async () => {
    const fromDate = prompt('Date de début (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    const toDate = prompt('Date de fin (YYYY-MM-DD):', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (!fromDate || !toDate) return;

    try {
      const result = await therapyService.generateSlots(fromDate, toDate);
      alert(`${result.slots_created} créneaux générés avec succès !`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la génération');
    }
  };

  if (loading) return <Loading />;

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Disponibilités Récurrentes</h1>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={handleGenerateSlots}>
            Générer des créneaux
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : 'Ajouter une disponibilité'}
          </Button>
        </div>
      </div>

      {error && <Error message={error} />}

      {/* Formulaire */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Nouvelle Disponibilité Récurrente</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Jour de la semaine *</label>
                <select
                  required
                  className="input"
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                >
                  {dayNames.slice(1).map((day, index) => (
                    <option key={index + 1} value={index + 1}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Heure de début *</label>
                <input
                  type="time"
                  required
                  className="input"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Heure de fin *</label>
                <input
                  type="time"
                  required
                  className="input"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Durée d'un créneau (minutes) *</label>
                <input
                  type="number"
                  required
                  className="input"
                  min="15"
                  max="480"
                  value={formData.slot_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, slot_duration_minutes: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">Nombre max de clients par créneau *</label>
                <input
                  type="number"
                  required
                  className="input"
                  min="1"
                  max="10"
                  value={formData.max_clients_per_slot}
                  onChange={(e) => setFormData({ ...formData, max_clients_per_slot: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">Prix par créneau (€)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.price_per_slot || ''}
                  onChange={(e) => setFormData({ ...formData, price_per_slot: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
              <div>
                <label className="label">Valide à partir de</label>
                <input
                  type="date"
                  className="input"
                  value={formData.valid_from || ''}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value || undefined })}
                />
              </div>
              <div>
                <label className="label">Valide jusqu'au</label>
                <input
                  type="date"
                  className="input"
                  value={formData.valid_until || ''}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value || undefined })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">Créer la disponibilité</Button>
          </form>
        </div>
      )}

      {/* Liste */}
      {availabilities.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Aucune disponibilité récurrente</p>
          <Button onClick={() => setShowForm(true)}>Ajouter une disponibilité</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {availabilities.map((availability) => (
            <div key={availability.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {dayNames[availability.day_of_week === 0 ? 7 : availability.day_of_week]} - {availability.start_time} à {availability.end_time}
                    </h3>
                    {availability.valid_from && (!availability.valid_until || new Date(availability.valid_until) > new Date()) ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Actif
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactif
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Durée créneau:</span> {availability.slot_duration_minutes} min
                    </div>
                    <div>
                      <span className="font-medium">Max clients:</span> {availability.max_clients_per_slot}
                    </div>
                    {availability.price_per_slot && (
                      <div>
                        <span className="font-medium">Prix:</span> {parseFloat(availability.price_per_slot).toFixed(2)} €
                      </div>
                    )}
                    {(availability.valid_from || availability.valid_until) && (
                      <div>
                        <span className="font-medium">Période:</span>{' '}
                        {availability.valid_from && new Date(availability.valid_from).toLocaleDateString('fr-FR')}
                        {availability.valid_until && ` - ${new Date(availability.valid_until).toLocaleDateString('fr-FR')}`}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(availability.id)}
                  className="ml-4"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringAvailabilityPage;
