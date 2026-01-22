import { useState } from 'react';
import TherapyCalendar from '../../components/Calendar/TherapyCalendar';
import { therapyService } from '../../services/therapyService';
import type { TherapySlot } from '../../types';
import Button from '../../components/Button';
import Error from '../../components/Error';

const CalendarView = () => {
  const [selectedSlot, setSelectedSlot] = useState<TherapySlot | null>(null);
  const [showSlotDetails, setShowSlotDetails] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    max_clients: 1,
    location: '',
    price: '',
    notes: '',
    hijama_type: '', // Nouveau : obligatoire
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSlotClick = (slot: TherapySlot) => {
    setSelectedSlot(slot);
    setShowSlotDetails(true);
  };

  const handleDateClick = (date: Date) => {
    // Ouvrir le formulaire avec la date pré-remplie
    setSelectedStart(date);
    setSelectedEnd(new Date(date.getTime() + 60 * 60 * 1000)); // +1 heure par défaut
    setShowCreateForm(true);
  };

  const handleSelect = (start: Date, end: Date) => {
    // Sélection d'une plage horaire
    setSelectedStart(start);
    setSelectedEnd(end);
    setShowCreateForm(true);
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedStart || !selectedEnd) {
      setError('Veuillez sélectionner une date et une heure');
      setLoading(false);
      return;
    }

    try {
      const dateStr = selectedStart.toISOString().split('T')[0];
      const startTime = selectedStart.toTimeString().slice(0, 5);
      const endTime = selectedEnd.toTimeString().slice(0, 5);
      const durationMinutes = Math.round((selectedEnd.getTime() - selectedStart.getTime()) / (1000 * 60));

      if (!formData.hijama_type) {
        setError('Le type de hijama est obligatoire');
        setLoading(false);
        return;
      }

      await therapyService.createSlot({
        date: dateStr,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        max_clients: formData.max_clients,
        location: formData.location || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        notes: formData.notes || undefined,
        hijama_type: formData.hijama_type, // Obligatoire
      });

      // Réinitialiser le formulaire
      setFormData({
        max_clients: 1,
        location: '',
        price: '',
        notes: '',
        hijama_type: '',
      });
      setShowCreateForm(false);
      setSelectedStart(null);
      setSelectedEnd(null);

      // Rafraîchir le calendrier
      window.dispatchEvent(new Event('refresh-calendar'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du créneau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vue Calendrier</h1>
          <p className="text-sm text-gray-600 mt-2">
            💡 Cliquez sur une date ou sélectionnez une plage horaire (vue semaine/jour) pour créer un créneau
          </p>
        </div>
        <Button onClick={() => window.location.href = '/therapy/slots'}>
          Gérer les créneaux
        </Button>
      </div>

      <TherapyCalendar
        onSlotClick={handleSlotClick}
        onDateClick={handleDateClick}
        onSelect={handleSelect}
      />

      {/* Modal de détails du créneau */}
      {showSlotDetails && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Détails du Créneau</h3>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Date:</span>{' '}
                {new Date(selectedSlot.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <div>
                <span className="font-medium">Heure:</span> {selectedSlot.start_time} - {selectedSlot.end_time}
              </div>
              <div>
                <span className="font-medium">Réservations:</span> {selectedSlot.booked_count}/{selectedSlot.max_clients}
              </div>
              {selectedSlot.location && (
                <div>
                  <span className="font-medium">Lieu:</span> {selectedSlot.location}
                </div>
              )}
              {selectedSlot.price && (
                <div>
                  <span className="font-medium">Prix:</span> {parseFloat(selectedSlot.price).toFixed(2)} €
                </div>
              )}
              {selectedSlot.notes && (
                <div>
                  <span className="font-medium">Notes:</span> {selectedSlot.notes}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowSlotDetails(false);
                  setSelectedSlot(null);
                }}
              >
                Fermer
              </Button>
              <Button onClick={() => window.location.href = `/therapy/slots`}>
                Voir les détails
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de créneau */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Créer un Créneau</h3>

            {error && <Error message={error} />}

            <form onSubmit={handleCreateSlot} className="space-y-4">
              {/* Date et heures (pré-remplies, non modifiables) */}
              <div className="space-y-2 text-sm bg-gray-50 p-3 rounded">
                <div>
                  <span className="font-medium">Date:</span>{' '}
                  {selectedStart?.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    weekday: 'long',
                  })}
                </div>
                <div>
                  <span className="font-medium">Heure:</span>{' '}
                  {selectedStart?.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {selectedEnd?.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div>
                  <span className="font-medium">Durée:</span>{' '}
                  {selectedStart && selectedEnd
                    ? Math.round((selectedEnd.getTime() - selectedStart.getTime()) / (1000 * 60))
                    : 0}{' '}
                  minutes
                </div>
              </div>

              {/* Nombre max de clients */}
              <div>
                <label className="label">
                  Nombre maximum de clients <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  max="10"
                  value={formData.max_clients}
                  onChange={(e) => setFormData({ ...formData, max_clients: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

              {/* Lieu */}
              <div>
                <label className="label">Lieu</label>
                <input
                  type="text"
                  className="input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Cabinet principal"
                />
              </div>

              {/* Type de hijama */}
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

              {/* Prix */}
              <div>
                <label className="label">Prix (€)</label>
                <input
                  type="number"
                  className="input"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Ex: 50.00"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informations supplémentaires..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setSelectedStart(null);
                    setSelectedEnd(null);
                    setError('');
                  }}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Création...' : 'Créer le créneau'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
