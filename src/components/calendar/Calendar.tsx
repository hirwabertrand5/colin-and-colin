import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { UserRole } from '../../App';

interface CalendarProps {
  userRole: UserRole;
}

export default function Calendar({ userRole }: CalendarProps) {
  const [currentView, setCurrentView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 30)); // Jan 30, 2026

  // ✅ Updated Rwandan events and case names
  const events = [
    {
      id: '1',
      title: 'Filing Deadline – Niyomugabo Case',
      case: 'Niyomugabo vs RRA',
      date: '2026-02-05',
      time: '5:00 PM',
      type: 'Deadline',
      color: 'red',
    },
    {
      id: '2',
      title: 'Court Hearing – Kamanzi Appeal',
      case: 'Kamanzi vs BNR',
      date: '2026-02-08',
      time: '10:00 AM',
      type: 'Court',
      color: 'blue',
    },
    {
      id: '3',
      title: 'Client Meeting – Uwimana Contract',
      case: 'Uwimana Contract Draft',
      date: '2026-01-31',
      time: '2:00 PM',
      type: 'Meeting',
      color: 'green',
    },
    {
      id: '4',
      title: 'Deposition – Mugenzi Dispute',
      case: 'Mugenzi vs Kigali City',
      date: '2026-02-03',
      time: '10:00 AM',
      type: 'Deposition',
      color: 'purple',
    },
    {
      id: '5',
      title: 'Expert Report Filing',
      case: 'Uwase Family Land Claim',
      date: '2026-02-12',
      time: 'End of Day',
      type: 'Deadline',
      color: 'red',
    },
    {
      id: '6',
      title: 'Partner Strategy Meeting',
      case: 'Internal – Colin & Colin',
      date: '2026-01-30',
      time: '9:00 AM',
      type: 'Meeting',
      color: 'green',
    },
  ];

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getEventsForDate = (day: number) => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-100 text-red-700 border-red-200';
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'green': return 'bg-green-100 text-green-700 border-green-200';
      case 'purple': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const goToPreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Firm Calendar</h1>
            <p className="text-gray-600">
              {userRole === 'managing_partner' && 'View and manage firm-wide legal milestones'}
              {userRole === 'associate' && 'Track your case-specific events and tasks'}
              {userRole === 'executive_assistant' && 'Coordinate scheduling & reminders for all files'}
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </button>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h2>
            <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('month')}
              className={`px-3 py-1 text-sm rounded ${
                currentView === 'month' ? 'bg-gray-800 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCurrentView('week')}
              className={`px-3 py-1 text-sm rounded ${
                currentView === 'week' ? 'bg-gray-800 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border rounded-lg overflow-hidden border-gray-200">
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Render Days */}
        <div className="grid grid-cols-7">
          {/* Blank cells for offset */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 border-b border-r bg-gray-50" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const isToday = day === 30 && selectedDate.getMonth() === 0;
            const dayEvents = getEventsForDate(day);

            return (
              <div key={day} className={`min-h-24 border-b border-r p-2 hover:bg-gray-50 ${isToday ? 'bg-blue-50' : ''}`}>
                <div className={`text-sm font-medium mb-1 ${isToday ? 'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center' : 'text-gray-900'}`}>
                  {day}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs px-1 py-0.5 rounded border truncate ${getColorClass(event.color)}`}
                      title={`${event.time} - ${event.title}`}
                    >
                      {event.time.split(' ')[0]} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {events
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map((event) => (
              <div key={event.id} className="px-5 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded border ${getColorClass(event.color)}`}>
                        {event.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.case}</p>
                    <p className="text-xs text-gray-600">{event.date} at {event.time}</p>
                  </div>
                  <button className="ml-4 px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">View</button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white border rounded-lg p-5 border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Event Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-sm text-gray-700">Deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-sm text-gray-700">Court</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-sm text-gray-700">Meeting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded" />
            <span className="text-sm text-gray-700">Deposition</span>
          </div>
        </div>
      </div>
    </div>
  );
}