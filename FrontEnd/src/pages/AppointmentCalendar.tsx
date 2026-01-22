import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientCalendar from '../components/Calendar/ClientCalendar';
import type { TherapySlot } from '../types';
import Button from '../components/Button';

const AppointmentCalendar = () => {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<TherapySlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [clientNotes, setClientNotes] = useState('');

  const handleSlotSelect = (slot: TherapySlot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleBooking = () => {
    if (!selectedSlot) return;
    
    // Rediriger vers la page de réservation avec le slot pré-sélectionné
    navigate('/appointments/new', {
      state: { selectedSlotId: selectedSlot.id },
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Réserver un Rendez-vous</h1>
        <Button onClick={() => navigate('/appointments/new')}>
          Formulaire de réservation
        </Button>
      </div>

      <ClientCalendar onSlotSelect={handleSlotSelect} />

      {/* Modal de réservation rapide */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Réserver ce créneau</h3>
            
            <div className="space-y-2 text-sm mb-4">
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
              {selectedSlot.therapist && (
                <div>
                  <span className="font-medium">Thérapeute:</span>{' '}
                  {selectedSlot.therapist.first_name} {selectedSlot.therapist.last_name}
                </div>
              )}
              {selectedSlot.price && (
                <div>
                  <span className="font-medium">Prix:</span> {parseFloat(selectedSlot.price).toFixed(2)} €
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="label">Notes (optionnel)</label>
              <textarea
                className="input"
                rows={3}
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Informations supplémentaires..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedSlot(null);
                  setClientNotes('');
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleBooking}>
                Réserver
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
