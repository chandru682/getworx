import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  CalendarDays,
  AlertCircle
} from 'lucide-react';
import type { Interview, Task } from './types';

interface CalendarTabProps {
  interviews: Interview[];
  tasks: Task[];
}

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'interview' | 'meeting' | 'followup' | 'offer_expiry' | 'joining' | 'reminder';
  candidateName?: string;
  details?: string;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ interviews: _interviews, tasks: _tasks }) => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed, so 6 is July
  const [selectedDay, setSelectedDay] = useState<number | null>(28); // Default to July 28, 2026

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Static list of calendar events mapped to days in July 2026
  const calendarEventsMap: { [day: number]: CalendarEvent[] } = {
    10: [
      { id: 'ev-1', title: 'Node.js Developer Job Live', time: '09:00 AM', type: 'meeting', details: 'Job board publishing completed' }
    ],
    15: [
      { id: 'ev-2', title: 'Review resumes for React opening', time: '02:00 PM', type: 'followup', details: 'Assigned to Sarah Connor' }
    ],
    20: [
      { id: 'ev-3', title: 'Lead AI Engineer Role Launch', time: '10:00 AM', type: 'meeting', details: 'Align with CTO Robert Lee' }
    ],
    22: [
      { id: 'ev-4', title: 'Emily Watson interview decision', time: '04:30 PM', type: 'reminder', details: 'Verify tech scoring metrics' }
    ],
    24: [
      { id: 'ev-5', title: 'Carlos Ruiz Onboarding Day', time: '09:30 AM', type: 'joining', candidateName: 'Carlos Ruiz', details: 'Review background check' }
    ],
    26: [
      { id: 'ev-6', title: 'Offer sent to Priya Sharma', time: '11:00 AM', type: 'followup', candidateName: 'Priya Sharma', details: 'Review compensation package' }
    ],
    27: [
      { id: 'ev-7', title: 'Elena Rostova Portfolio Review', time: '04:00 PM', type: 'interview', candidateName: 'Elena Rostova', details: 'Google Meet link active' }
    ],
    28: [
      { id: 'ev-8', title: 'Alex Morgan React Architecture Screen', time: '10:00 AM', type: 'interview', candidateName: 'Alex Morgan', details: 'Panel: Sarah C & Jonathan V' },
      { id: 'ev-9', title: 'Priya Sharma Offer Acceptance Expiry', time: '06:00 PM', type: 'offer_expiry', candidateName: 'Priya Sharma', details: 'Check signed offer PDF' },
      { id: 'ev-10', title: 'Marcus Aurelius Screening Sync', time: '03:30 PM', type: 'interview', candidateName: 'Marcus Aurelius', details: 'Technical screening questionnaire' }
    ],
    29: [
      { id: 'ev-11', title: 'David Chen Final AI Discussion', time: '02:00 PM', type: 'interview', candidateName: 'David Chen', details: 'Zoom interview room' },
      { id: 'ev-12', title: 'Approve offer draft for Alex Morgan', time: '11:00 AM', type: 'reminder', candidateName: 'Alex Morgan', details: 'Verify salary guidelines' }
    ],
    30: [
      { id: 'ev-13', title: 'Sarah Jenkins Kubernetes Deep-Dive', time: '09:00 AM', type: 'interview', candidateName: 'Sarah Jenkins', details: 'Panel: Bobby A & Dave M' }
    ],
    31: [
      { id: 'ev-14', title: 'Talent Acquisition Team Retrospective', time: '04:00 PM', type: 'meeting', details: 'Monthly review & KPIs' }
    ]
  };

  // Days in month calculator
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  // Compile grid array
  const calendarCells = [];
  // Blank cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  // Month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(i);
  }

  const selectedEvents = selectedDay ? calendarEventsMap[selectedDay] || [] : [];

  return (
    <div className="calendar-workspace font-sans">
      
      <div className="calendar-header">
        <div>
          <h1>Recruitment Calendar</h1>
          <p>Track candidate screenings, offer expiries, follow-ups, and corporate onboarding schedules.</p>
        </div>
        <div className="calendar-nav-controls">
          <button className="nav-btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
          <h2>{monthNames[currentMonth]} {currentYear}</h2>
          <button className="nav-btn" onClick={nextMonth}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="calendar-split-layout">
        
        {/* Calendar Grid Left */}
        <div className="calendar-grid-card">
          <div className="weekdays-row">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="days-grid">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="day-cell empty"></div>;
              }

              const hasEvents = !!calendarEventsMap[day];
              const isSelected = selectedDay === day;

              return (
                <div 
                  key={`day-${day}`} 
                  className={`day-cell ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <span className="day-num">{day}</span>
                  {hasEvents && (
                    <div className="event-indicators">
                      {calendarEventsMap[day].slice(0, 3).map(ev => (
                        <span key={ev.id} className={`indicator-dot ${ev.type}`}></span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule Agenda Right */}
        <div className="calendar-agenda-card">
          <div className="agenda-header">
            <CalendarDays size={18} />
            <h3>Agenda for {selectedDay ? `${monthNames[currentMonth]} ${selectedDay}, ${currentYear}` : 'Select a Day'}</h3>
          </div>

          <div className="agenda-body scroll-y max-h-400">
            {selectedEvents.length > 0 ? (
              <div className="agenda-events-list">
                {selectedEvents.map(ev => (
                  <div key={ev.id} className={`agenda-event-item ${ev.type} animate-fade-in`}>
                    <div className="item-left">
                      <div className="time-badge">
                        <Clock size={12} />
                        <span>{ev.time}</span>
                      </div>
                      <span className={`event-type-pill ${ev.type}`}>{ev.type.replace('_', ' ')}</span>
                    </div>

                    <div className="item-details">
                      <h4>{ev.title}</h4>
                      {ev.candidateName && (
                        <div className="candidate-ref">
                          <User size={12} />
                          <span>Candidate: {ev.candidateName}</span>
                        </div>
                      )}
                      {ev.details && <p className="details-txt">{ev.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-agenda-state">
                <AlertCircle size={32} />
                <p>No recruitment activities scheduled for this day.</p>
                <span>Select another day with a dot indicator on the calendar.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
