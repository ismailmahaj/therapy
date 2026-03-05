import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { appointmentService } from '../../services/appointmentService';
import type { TherapySlot } from '../../types';
import Loading from '../Loading';
import Error from '../Error';
import Button from '../Button';

interface ClientCalendarProps {
  therapistId?: number;
  onSlotSelect?: (slot: TherapySlot) => void;
}

const ClientCalendar = ({ therapistId, onSlotSelect }: ClientCalendarProps) => {
  const [slots, setSlots] = useState<TherapySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');

  useEffect(() => {
    loadSlots();
  }, [therapistId]);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const data = therapistId
        ? await appointmentService.getTherapistSlots(therapistId, {
            from_date: new Date().toISOString().split('T')[0],
          })
        : await appointmentService.getAvailableSlots({
            from_date: new Date().toISOString().split('T')[0],
          });
      setSlots(data.filter(slot => slot.statut === 'available' && slot.booked_count < slot.max_clients));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des créneaux');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (arg: any) => {
    const slotId = parseInt(arg.event.id);
    const slot = slots.find(s => s.id === slotId);
    if (slot && onSlotSelect) {
      onSlotSelect(slot);
    }
  };

  const handleDateClick = (arg: any) => {
    // Optionnel : créer un créneau rapide
    if (import.meta.env.DEV) {
      console.log('Date cliquée:', arg.date);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadSlots} />;

  // Préparer les événements pour FullCalendar
  const events = slots
    .filter(slot => {
      // Filtrer les slots avec des dates/heures valides
      return (
        slot.date &&
        slot.start_time &&
        slot.end_time &&
        slot.date.trim() !== '' &&
        slot.start_time.trim() !== '' &&
        slot.end_time.trim() !== ''
      );
    })
    .map(slot => {
      // Formater la date et l'heure correctement
      const dateStr = slot.date.includes('T') ? slot.date.split('T')[0] : slot.date;
      const startTimeStr = slot.start_time.includes(':') ? slot.start_time : `${slot.start_time.slice(0, 2)}:${slot.start_time.slice(2, 4)}`;
      const endTimeStr = slot.end_time.includes(':') ? slot.end_time : `${slot.end_time.slice(0, 2)}:${slot.end_time.slice(2, 4)}`;
      
      // Créer les dates avec validation
      const date = new Date(`${dateStr}T${startTimeStr}`);
      const endDate = new Date(`${dateStr}T${endTimeStr}`);
      
      // Vérifier que les dates sont valides
      if (isNaN(date.getTime()) || isNaN(endDate.getTime())) {
        if (import.meta.env.DEV) {
          console.warn('Date invalide pour le slot:', slot);
        }
        return null;
      }
      
      const remaining = slot.max_clients - slot.booked_count;
      
      return {
        id: slot.id.toString(),
        title: `${remaining} place${remaining > 1 ? 's' : ''} ${slot.price ? `- ${parseFloat(slot.price).toFixed(2)}€` : ''}`,
        start: date.toISOString(),
        end: endDate.toISOString(),
        color: '#10b981', // Vert pour disponible
        extendedProps: {
          slot: slot,
        },
      };
    })
    .filter((event): event is NonNullable<typeof event> => event !== null);

  return (
    <div className="card">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Créneaux Disponibles</h2>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => setCurrentView('dayGridMonth')}
            className={currentView === 'dayGridMonth' ? 'bg-primary-100' : ''}
          >
            Mois
          </Button>
          <Button
            variant="secondary"
            onClick={() => setCurrentView('timeGridWeek')}
            className={currentView === 'timeGridWeek' ? 'bg-primary-100' : ''}
          >
            Semaine
          </Button>
          <Button
            variant="secondary"
            onClick={() => setCurrentView('timeGridDay')}
            className={currentView === 'timeGridDay' ? 'bg-primary-100' : ''}
          >
            Jour
          </Button>
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={currentView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        locale={frLocale}
        firstDay={1}
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="auto"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        views={{
          dayGridMonth: { dayMaxEvents: 3 },
          timeGridWeek: { slotDuration: '00:30:00' },
          timeGridDay: { slotDuration: '00:30:00' },
        }}
      />

      <div className="mt-4 text-sm text-gray-600">
        <p>💡 Cliquez sur un créneau disponible pour le réserver</p>
      </div>
    </div>
  );
};

export default ClientCalendar;
