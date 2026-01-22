import { useEffect, useState } from 'react';
import { therapyService } from '../../services/therapyService';
import type { TherapySlot } from '../../types';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import Button from '../../components/Button';

const MySlots = () => {
  const [slots, setSlots] = useState<TherapySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    max_clients: 1,
    location: '',
    price: '',
    notes: '',
    hijama_type: '', // Nouveau : obligatoire
  });
  const [filters, setFilters] = useState({
    date: '',
    statut: '',
  });

  useEffect(() => {
    loadSlots();
  }, [filters]);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.date) params.date = filters.date;
      if (filters.statut) params.statut = filters.statut;
      
      const data = await therapyService.getSlots(params);
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
      await therapyService.createSlot({
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
        hijama_type: formData.hijama_type, // Obligatoire
      });
      setFormData({
        date: '',
        start_time: '',
        end_time: '',
        duration_minutes: 60,
        max_clients: 1,
        location: '',
        price: '',
        notes: '',
        hijama_type: '',
      });
      setShowForm(false);
      loadSlots();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du créneau');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      return;
    }

    try {
      await therapyService.deleteSlot(id);
      loadSlots();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) return <Loading />;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusBadge = (statut: string) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      full: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[statut as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (statut: string) => {
    const labels = {
      available: 'Disponible',
      full: 'Complet',
      cancelled: 'Annulé',
    };
    return labels[statut as keyof typeof labels] || statut;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Créneaux</h1>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => window.location.href = '/therapy/calendar'}>
            📅 Vue Calendrier
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : 'Créer un créneau'}
          </Button>
        </div>
      </div>

      {error && <Error message={error} />}

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
              <option value="available">Disponible</option>
              <option value="full">Complet</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Nouveau Créneau</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Date *</label>
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
                <label className="label">Durée (minutes)</label>
                <input
                  type="number"
                  className="input"
                  min="15"
                  max="480"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">Nombre max de clients *</label>
                <input
                  type="number"
                  required
                  className="input"
                  min="1"
                  max="10"
                  value={formData.max_clients}
                  onChange={(e) => setFormData({ ...formData, max_clients: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">Prix (€)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">
                Type de hijama <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="input"
                value={formData.hijama_type}
                onChange={(e) => setFormData({ ...formData, hijama_type: e.target.value })}
              >
                <option value="">Sélectionnez un type</option>
                <option value="hijama_seche">Hijama Sèche</option>
                <option value="hijama_humide">Hijama Humide</option>
                <option value="hijama_sunnah">Hijama Sunnah</option>
                <option value="hijama_esthetique">Hijama Esthétique</option>
                <option value="autres">Autres</option>
              </select>
            </div>
            <div>
              <label className="label">Lieu</label>
              <input
                type="text"
                className="input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Adresse ou lieu du rendez-vous"
              />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                className="input"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes internes..."
              />
            </div>
            <Button type="submit" className="w-full">Créer le créneau</Button>
          </form>
        </div>
      )}

      {/* Liste des créneaux */}
      {slots.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Aucun créneau créé</p>
          <Button onClick={() => setShowForm(true)}>Créer un créneau</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {slots.map((slot) => (
            <div key={slot.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatDate(slot.date)} - {slot.start_time} à {slot.end_time}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(slot.statut)}`}>
                      {getStatusLabel(slot.statut)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Réservations:</span> {slot.booked_count}/{slot.max_clients}
                    </div>
                    {slot.location && (
                      <div>
                        <span className="font-medium">Lieu:</span> {slot.location}
                      </div>
                    )}
                    {slot.price && (
                      <div>
                        <span className="font-medium">Prix:</span> {parseFloat(slot.price).toFixed(2)} €
                      </div>
                    )}
                    {slot.hijama_type && (
                      <div>
                        <span className="font-medium">Type:</span> {
                          slot.hijama_type === 'hijama_seche' ? 'Hijama Sèche' :
                          slot.hijama_type === 'hijama_humide' ? 'Hijama Humide' :
                          slot.hijama_type === 'hijama_sunnah' ? 'Hijama Sunnah' :
                          slot.hijama_type === 'hijama_esthetique' ? 'Hijama Esthétique' :
                          slot.hijama_type
                        }
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Durée:</span> {slot.duration_minutes} min
                    </div>
                  </div>
                  {slot.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {slot.notes}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(slot.id)}
                    disabled={slot.booked_count > 0}
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

export default MySlots;
