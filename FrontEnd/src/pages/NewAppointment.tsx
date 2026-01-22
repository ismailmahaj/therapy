import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../hooks/useAuth';
import type { TherapySlot, User, AppointmentPersonData } from '../types';
import Button from '../components/Button';
import Error from '../components/Error';
import Loading from '../components/Loading';

type PersonGroup = {
  sexe: 'homme' | 'femme';
  persons: AppointmentPersonData[];
  selectedSlot: TherapySlot | null;
};

const NewAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [therapists, setTherapists] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState<TherapySlot[]>([]);
  const [personGroups, setPersonGroups] = useState<PersonGroup[]>([
    {
      sexe: user?.sexe || 'homme',
      persons: [{ prenom: user?.first_name || '', sexe: user?.sexe || 'homme' }],
      selectedSlot: null,
    },
  ]);
  const [clientNotes, setClientNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Si un slot est pré-sélectionné depuis le calendrier
  const preselectedSlotId = (location.state as any)?.selectedSlotId;
  
  useEffect(() => {
    loadTherapists();
  }, []);

  useEffect(() => {
    loadSlotsByDate();
  }, [selectedDate]);

  useEffect(() => {
    if (preselectedSlotId && availableSlots.length > 0) {
      const slot = availableSlots.find(s => s.id === preselectedSlotId);
      if (slot && personGroups.length > 0) {
        // Trouver le groupe correspondant au sexe du thérapeute
        const matchingGroup = personGroups.find(g => g.sexe === slot.sexe_therapeute);
        if (matchingGroup) {
          setPersonGroups(prev => prev.map(g => 
            g.sexe === matchingGroup.sexe 
              ? { ...g, selectedSlot: slot }
              : g
          ));
        }
      }
    }
  }, [preselectedSlotId, availableSlots, personGroups]);

  const loadTherapists = async () => {
    try {
      const data = await appointmentService.getTherapists();
      setTherapists(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des thérapeutes');
    }
  };

  const loadSlotsByDate = async () => {
    setLoadingSlots(true);
    setError('');
    try {
      // Charger tous les créneaux pour la date (hommes et femmes)
      const data = await appointmentService.getAvailableSlots({
        date: selectedDate,
        from_date: selectedDate,
        to_date: selectedDate,
      });
      
      // Filtrer uniquement les créneaux disponibles
      const available = data.filter(
        slot => slot.statut === 'available' && slot.booked_count < slot.max_clients
      );
      
      setAvailableSlots(available);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des créneaux');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation : chaque groupe doit avoir un créneau sélectionné
    const groupsWithoutSlot = personGroups.filter(g => !g.selectedSlot || g.persons.length === 0);
    if (groupsWithoutSlot.length > 0) {
      setError('Veuillez sélectionner un créneau pour chaque groupe de personnes');
      return;
    }

    // Validation : chaque personne doit avoir un prénom
    for (const group of personGroups) {
      if (group.persons.some(p => !p.prenom.trim())) {
        setError('Tous les prénoms sont obligatoires');
        return;
      }
    }

    setLoading(true);

    try {
      // Préparer les données pour l'API
      const appointments = personGroups.map(group => ({
        slot_id: group.selectedSlot!.id,
        persons: group.persons,
        client_notes: clientNotes || undefined,
      }));

      // Si un seul rendez-vous, utiliser l'endpoint simple
      if (appointments.length === 1) {
        const response = await appointmentService.create(appointments[0]);
        navigate('/appointments', {
          state: {
            message: 'Rendez-vous créé ! Veuillez compléter le paiement.',
            paymentIntent: response.client_secret,
          },
        });
      } else {
        // Plusieurs rendez-vous, utiliser l'endpoint multiple
        const response = await appointmentService.createMultiple(appointments);
        navigate('/appointments', {
          state: {
            message: `${response.appointments.length} rendez-vous créés ! Veuillez compléter le paiement.`,
            paymentIntent: response.client_secret,
          },
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création du rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const addPerson = (groupIndex: number) => {
    setPersonGroups(prev => prev.map((group, idx) => {
      if (idx === groupIndex && group.persons.length < 10) {
        return {
          ...group,
          persons: [...group.persons, { prenom: '', sexe: group.sexe }],
        };
      }
      return group;
    }));
  };

  const removePerson = (groupIndex: number, personIndex: number) => {
    setPersonGroups(prev => prev.map((group, idx) => {
      if (idx === groupIndex && group.persons.length > 1) {
        return {
          ...group,
          persons: group.persons.filter((_, i) => i !== personIndex),
        };
      }
      return group;
    }));
  };

  const updatePerson = (groupIndex: number, personIndex: number, field: keyof AppointmentPersonData, value: string) => {
    setPersonGroups(prev => prev.map((group, idx) => {
      if (idx === groupIndex) {
        const updatedPersons = [...group.persons];
        updatedPersons[personIndex] = { ...updatedPersons[personIndex], [field]: value };
        return { ...group, persons: updatedPersons };
      }
      return group;
    }));
  };

  const addPersonGroup = () => {
    // Trouver le sexe opposé
    const existingSexes = personGroups.map(g => g.sexe);
    const newSexe = existingSexes.includes('homme') && existingSexes.includes('femme')
      ? 'homme' // Si les deux existent déjà, ajouter homme par défaut
      : existingSexes.includes('homme') ? 'femme' : 'homme';
    
    setPersonGroups(prev => [...prev, {
      sexe: newSexe,
      persons: [{ prenom: '', sexe: newSexe }],
      selectedSlot: null,
    }]);
  };

  const removePersonGroup = (groupIndex: number) => {
    if (personGroups.length > 1) {
      setPersonGroups(prev => prev.filter((_, idx) => idx !== groupIndex));
    }
  };

  const selectSlotForGroup = (groupIndex: number, slot: TherapySlot) => {
    // Vérifier que le slot correspond au sexe du groupe
    if (slot.sexe_therapeute !== personGroups[groupIndex].sexe) {
      setError(`Ce créneau est pour un thérapeute ${slot.sexe_therapeute === 'homme' ? 'homme' : 'femme'}, mais ce groupe contient des personnes ${personGroups[groupIndex].sexe === 'homme' ? 'hommes' : 'femmes'}`);
      return;
    }

    setPersonGroups(prev => prev.map((group, idx) => 
      idx === groupIndex ? { ...group, selectedSlot: slot } : group
    ));
    setError('');
  };

  const getSlotsForSexe = (sexe: 'homme' | 'femme') => {
    return availableSlots.filter(slot => slot.sexe_therapeute === sexe);
  };

  const formatSlotTime = (slot: TherapySlot) => {
    if (!slot.date || !slot.start_time || !slot.end_time) {
      return 'Date non disponible';
    }

    try {
      const dateStr = slot.date.includes('T') ? slot.date.split('T')[0] : slot.date;
      const startTimeStr = slot.start_time.includes(':') 
        ? slot.start_time 
        : `${slot.start_time.slice(0, 2)}:${slot.start_time.slice(2, 4)}`;
      const endTimeStr = slot.end_time.includes(':') 
        ? slot.end_time 
        : `${slot.end_time.slice(0, 2)}:${slot.end_time.slice(2, 4)}`;

      const date = new Date(`${dateStr}T${startTimeStr}`);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }

      const dateFormatted = date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      return `${dateFormatted} à ${startTimeStr} - ${endTimeStr}`;
    } catch (error) {
      return 'Date invalide';
    }
  };

  const calculateTotal = () => {
    return personGroups.reduce((total, group) => {
      if (group.selectedSlot && group.selectedSlot.price) {
        return total + parseFloat(group.selectedSlot.price);
      }
      return total;
    }, 0);
  };

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Prendre Rendez-vous Hijama</h1>
        <Button variant="secondary" onClick={() => navigate('/appointments/calendar')}>
          📅 Vue Calendrier
        </Button>
      </div>

      {error && <Error message={error} />}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Sélection de la date */}
        <div>
          <label className="label">Choisir une date <span className="text-red-500">*</span></label>
          <input
            type="date"
            className="input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        {/* Groupes de personnes */}
        {personGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="border-2 border-gray-200 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Groupe {groupIndex + 1} - {group.sexe === 'homme' ? '👨 Hommes' : '👩 Femmes'}
              </h2>
              {personGroups.length > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removePersonGroup(groupIndex)}
                >
                  Supprimer ce groupe
                </Button>
              )}
            </div>

            {/* Personnes dans ce groupe */}
            <div className="space-y-3">
              <label className="label">Personnes concernées <span className="text-red-500">*</span></label>
              {group.persons.map((person, personIndex) => (
                <div key={personIndex} className="flex gap-2 items-start p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="input mb-2"
                      placeholder="Prénom"
                      value={person.prenom}
                      onChange={(e) => updatePerson(groupIndex, personIndex, 'prenom', e.target.value)}
                      required
                    />
                    <div className="text-sm text-gray-600">
                      Sexe: {group.sexe === 'homme' ? 'Homme' : 'Femme'} (défini par le groupe)
                    </div>
                  </div>
                  {group.persons.length > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => removePerson(groupIndex, personIndex)}
                      className="mt-0"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              {group.persons.length < 10 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => addPerson(groupIndex)}
                  className="w-full"
                >
                  + Ajouter une personne à ce groupe
                </Button>
              )}
            </div>

            {/* Sélection du créneau pour ce groupe */}
            <div>
              <label className="label">
                Sélectionner un créneau pour ce groupe <span className="text-red-500">*</span>
              </label>
              {loadingSlots ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chargement des créneaux...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const slotsForGroup = getSlotsForSexe(group.sexe);
                    const slotsByTherapist = slotsForGroup.reduce((acc, slot) => {
                      const therapistId = slot.therapy_user_id || slot.therapist?.id || 'unknown';
                      const therapistName = slot.therapist 
                        ? `${slot.therapist.first_name} ${slot.therapist.last_name}`
                        : `Thérapeute #${therapistId}`;
                      
                      if (!acc[therapistId]) {
                        acc[therapistId] = {
                          therapist: slot.therapist || { id: therapistId, first_name: '', last_name: '' } as User,
                          name: therapistName,
                          slots: [],
                        };
                      }
                      acc[therapistId].slots.push(slot);
                      return acc;
                    }, {} as Record<number | string, { therapist: User; name: string; slots: TherapySlot[] }>);

                    if (Object.keys(slotsByTherapist).length === 0) {
                      return (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-500 mb-2">
                            Aucun créneau disponible pour les thérapeutes {group.sexe === 'homme' ? 'hommes' : 'femmes'} à cette date
                          </p>
                        </div>
                      );
                    }

                    return Object.values(slotsByTherapist).map(({ therapist, name, slots }) => (
                      <div key={therapist.id || 'unknown'} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              👤 {name}
                            </h3>
                            {therapist.specialization && (
                              <p className="text-sm text-gray-600 mt-1">{therapist.specialization}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {slots
                            .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                            .map((slot) => (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => selectSlotForGroup(groupIndex, slot)}
                                className={`p-3 border-2 rounded-lg text-left transition ${
                                  group.selectedSlot?.id === slot.id
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-primary-300'
                                }`}
                              >
                                <div className="font-medium text-gray-900 mb-1">
                                  {(() => {
                                    const startTime = slot.start_time?.includes(':') 
                                      ? slot.start_time 
                                      : `${slot.start_time?.slice(0, 2) || ''}:${slot.start_time?.slice(2, 4) || ''}`;
                                    const endTime = slot.end_time?.includes(':') 
                                      ? slot.end_time 
                                      : `${slot.end_time?.slice(0, 2) || ''}:${slot.end_time?.slice(2, 4) || ''}`;
                                    return `${startTime} - ${endTime}`;
                                  })()}
                                </div>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                  <span className="text-xs text-gray-600">
                                    {slot.max_clients - slot.booked_count} place{slot.max_clients - slot.booked_count > 1 ? 's' : ''}
                                  </span>
                                  {slot.price && (
                                    <span className="font-semibold text-primary-600 text-sm">
                                      {parseFloat(slot.price).toFixed(2)} €
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            {/* Résumé du créneau sélectionné pour ce groupe */}
            {group.selectedSlot && (
              <div className="bg-primary-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Créneau sélectionné</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Date et heure:</span>
                    <span className="font-medium">{formatSlotTime(group.selectedSlot)}</span>
                  </div>
                  {group.selectedSlot.therapist && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Thérapeute:</span>
                      <span className="font-medium">
                        {group.selectedSlot.therapist.first_name} {group.selectedSlot.therapist.last_name}
                      </span>
                    </div>
                  )}
                  {group.selectedSlot.price && (
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Acompte:</span>
                      <span className="text-primary-600">{parseFloat(group.selectedSlot.price).toFixed(2)} €</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Bouton pour ajouter un groupe */}
        {personGroups.length < 2 && (
          <Button
            type="button"
            variant="secondary"
            onClick={addPersonGroup}
            className="w-full"
          >
            + Ajouter un groupe pour personnes de l'autre sexe
          </Button>
        )}

        {/* Notes client */}
        <div>
          <label className="label">Notes (optionnel)</label>
          <textarea
            className="input"
            rows={3}
            value={clientNotes}
            onChange={(e) => setClientNotes(e.target.value)}
            placeholder="Informations supplémentaires..."
          />
        </div>

        {/* Résumé total */}
        {personGroups.every(g => g.selectedSlot) && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-gray-900 mb-2">Résumé total</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Nombre de rendez-vous:</span>
                <span className="font-medium">{personGroups.length}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total à payer:</span>
                <span className="text-primary-600">{calculateTotal().toFixed(2)} €</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Paiement sécurisé via Stripe</span>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={!personGroups.every(g => g.selectedSlot && g.persons.length > 0)}
        >
          {personGroups.every(g => g.selectedSlot)
            ? `Confirmer et Payer ${calculateTotal().toFixed(2)} €`
            : 'Veuillez sélectionner un créneau pour chaque groupe'}
        </Button>
      </form>
    </div>
  );
};

export default NewAppointment;
