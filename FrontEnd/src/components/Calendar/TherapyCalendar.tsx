import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { therapyService } from '../../services/therapyService';
import type { TherapySlot, Appointment } from '../../types';
import Loading from '../Loading';
import Error from '../Error';
import Button from '../Button';

interface TherapyCalendarProps {
  onSlotClick?: (slot: TherapySlot) => void;
  onDateClick?: (date: Date) => void;
  onSelect?: (start: Date, end: Date) => void;
  onRefresh?: () => void;
  view?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
}

const TherapyCalendar = ({ onSlotClick, onDateClick, onSelect, onRefresh, view = 'dayGridMonth' }: TherapyCalendarProps) => {
  const [slots, setSlots] = useState<TherapySlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState(view);

  useEffect(() => {
    loadData();
  }, []);

  // Rafraîchir les données quand l'événement est déclenché
  useEffect(() => {
    const refreshHandler = () => loadData();
    window.addEventListener('refresh-calendar', refreshHandler);
    return () => window.removeEventListener('refresh-calendar', refreshHandler);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [slotsData, appointmentsData] = await Promise.all([
        therapyService.getSlots(),
        therapyService.getAppointments(),
      ]);
      setSlots(slotsData);
      setAppointments(appointmentsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (arg: any) => {
    if (onDateClick) {
      onDateClick(arg.date);
    }
  };

  const handleEventClick = (arg: any) => {
    const slotId = parseInt(arg.event.id);
    const slot = slots.find(s => s.id === slotId);
    if (slot && onSlotClick) {
      onSlotClick(slot);
    }
  };

  const handleSelect = (arg: any) => {
    // Sélection d'une plage horaire (vue semaine/jour uniquement)
    if (onSelect && (currentView === 'timeGridWeek' || currentView === 'timeGridDay')) {
      onSelect(arg.start, arg.end);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

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
        console.warn('Date invalide pour le slot:', slot);
        return null;
      }
      
      // Compter les rendez-vous pour ce slot
      const slotAppointments = appointments.filter(a => a.slot_id === slot.id);
      const confirmedCount = slotAppointments.filter(a => a.statut === 'confirmed').length;
      
      // Couleur selon le statut
      let color = '#3b82f6'; // Bleu par défaut (available)
      if (slot.statut === 'full') color = '#f59e0b'; // Orange (complet)
      if (slot.statut === 'cancelled') color = '#ef4444'; // Rouge (annulé)
      
      return {
        id: slot.id.toString(),
        title: `${slot.booked_count}/${slot.max_clients} ${slot.price ? `- ${parseFloat(slot.price).toFixed(2)}€` : ''}`,
        start: date.toISOString(),
        end: endDate.toISOString(),
        color: color,
        extendedProps: {
          slot: slot,
          appointments: slotAppointments,
        },
      };
    })
    .filter((event): event is NonNullable<typeof event> => event !== null);

  return (
    <div className="card">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Calendrier des Créneaux</h2>
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
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        select={handleSelect}
        height="auto"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        editable={false}
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

      {/* Légende */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>Complet</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Annulé</span>
        </div>
      </div>
    </div>
  );
};

export default TherapyCalendar;
