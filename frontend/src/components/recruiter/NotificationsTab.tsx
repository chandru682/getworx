import React, { useState } from 'react';
import { 
  Bell, 
  Sparkles, 
  UserCheck, 
  Check, 
  Trash2, 
  Calendar
} from 'lucide-react';

interface NotificationsTabProps {
  notifications: any[];
  onMarkRead: (notifId: string) => void;
  onClearAll: () => void;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications,
  onMarkRead,
  onClearAll
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ai' | 'reminder' | 'applicant' | 'general'>('all');

  const filteredNotifs = notifications.filter(n => {
    if (activeCategory === 'all') return true;
    const typeStr = (n.type || '').toLowerCase();
    if (activeCategory === 'ai') return typeStr.includes('ai_recommendation');
    if (activeCategory === 'reminder') return typeStr.includes('reminder');
    if (activeCategory === 'applicant') return typeStr.includes('applicant') || typeStr.includes('application');
    if (activeCategory === 'general') return !typeStr.includes('ai') && !typeStr.includes('reminder') && !typeStr.includes('applic');
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'ai_recommendation':
        return <Sparkles size={16} className="purple-txt animate-bounce-slow" />;
      case 'interview_reminder':
        return <Calendar size={16} className="blue-txt" />;
      case 'new_applicant':
        return <UserCheck size={16} className="green-txt" />;
      case 'offer_accepted':
        return <Check size={16} className="green-txt" />;
      default:
        return <Bell size={16} className="gray-txt" />;
    }
  };

  return (
    <div className="notifications-workspace font-sans">
      <div className="notif-header">
        <div>
          <h1>Recruiter Notification Center</h1>
          <p>Review real-time updates regarding interview schedules, talent applications, offer sign-offs, and AI suggestions.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary font-sans" onClick={onClearAll}>
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="notif-tabs-row">
        <button className={`notif-tab ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
          All Alerts ({notifications.length})
        </button>
        <button className={`notif-tab ${activeCategory === 'ai' ? 'active' : ''}`} onClick={() => setActiveCategory('ai')}>
          AI Match Recommendations ({notifications.filter(n => n.category === 'ai').length})
        </button>
        <button className={`notif-tab ${activeCategory === 'reminder' ? 'active' : ''}`} onClick={() => setActiveCategory('reminder')}>
          Calendar Reminders ({notifications.filter(n => n.category === 'reminder').length})
        </button>
        <button className={`notif-tab ${activeCategory === 'applicant' ? 'active' : ''}`} onClick={() => setActiveCategory('applicant')}>
          Applications ({notifications.filter(n => n.category === 'applicant').length})
        </button>
        <button className={`notif-tab ${activeCategory === 'general' ? 'active' : ''}`} onClick={() => setActiveCategory('general')}>
          General ({notifications.filter(n => n.category === 'general').length})
        </button>
      </div>

      {/* Notifications list */}
      <div className="notifications-list-card animate-slide-up">
        {filteredNotifs.length > 0 ? (
          <div className="notif-list scroll-y max-h-450">
            {filteredNotifs.map(notif => (
              <div 
                key={notif.id} 
                className={`notif-list-item ${notif.is_read ? 'read' : 'unread'}`}
              >
                <div className="item-icon-wrapper">
                  {getIcon(notif.type)}
                </div>
                
                <div className="item-body">
                  <div className="title-row">
                    <h4>{notif.title}</h4>
                    <span className="time">
                      {new Date(notif.created_at).toLocaleDateString()} {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p>{notif.message}</p>
                </div>

                {!notif.is_read && (
                  <button className="mark-read-btn" onClick={() => onMarkRead(notif.id)} title="Mark as Read">
                    <Check size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-notif-state">
            <Bell size={48} />
            <h3>No notifications to display</h3>
            <p>You have resolved all notifications under this category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
