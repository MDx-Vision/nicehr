import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import {
  Calendar,
  Clock,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Sun,
} from 'lucide-react';

interface Consultant {
  id: number;
  name: string;
  email: string;
  status: string;
  specialties: Array<{ department: string; proficiency: string }>;
}

interface BusySlot {
  start: string;
  end: string;
  topic: string;
}

const DEPARTMENTS = [
  'ER', 'Pharmacy', 'Radiology', 'Lab', 'IT', 'Build',
  'Registration', 'Billing', 'Nursing', 'Surgery', 'ICU', 'Outpatient',
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00',
];

const DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
];

const RECURRENCE_PATTERNS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export default function ScheduleSession() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(getNextWeekday());
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [department, setDepartment] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // All-day dedicated support options
  const [isAllDay, setIsAllDay] = useState(false);
  const [allDayStartTime, setAllDayStartTime] = useState('09:00');
  const [allDayEndTime, setAllDayEndTime] = useState('17:00');

  // Recurring session options
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('weekly');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  // Get next weekday
  function getNextWeekday() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  }

  // Fetch consultants
  useEffect(() => {
    fetch('/api/consultants')
      .then(res => res.json())
      .then(data => {
        setConsultants(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch consultants:', err);
        setLoading(false);
      });
  }, []);

  // Fetch consultant availability when consultant or date changes
  useEffect(() => {
    if (selectedConsultant && selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      fetch(`/api/schedule/consultant/${selectedConsultant.id}/availability?date=${dateStr}`)
        .then(res => res.json())
        .then(data => setBusySlots(data))
        .catch(console.error);
    }
  }, [selectedConsultant, selectedDate]);

  const isSlotAvailable = (time: string) => {
    const slotStart = new Date(`${selectedDate.toISOString().split('T')[0]}T${time}:00`);
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

    // Check if slot is in the past
    if (slotStart <= new Date()) return false;

    // Check for conflicts
    return !busySlots.some(busy => {
      const busyStart = new Date(busy.start);
      const busyEnd = new Date(busy.end);
      return slotStart < busyEnd && slotEnd > busyStart;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    // Skip weekends
    while (newDate.getDay() === 0 || newDate.getDay() === 6) {
      newDate.setDate(newDate.getDate() + (days > 0 ? 1 : -1));
    }
    // Don't go to past dates
    if (newDate > new Date()) {
      setSelectedDate(newDate);
      setSelectedTime('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedConsultant || (!isAllDay && !selectedTime) || !topic.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (isRecurring && !recurrenceEndDate) {
      setError('Please select an end date for recurring sessions');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const timeToUse = isAllDay ? allDayStartTime : selectedTime;
      const scheduledAt = `${selectedDate.toISOString().split('T')[0]}T${timeToUse}:00.000Z`;

      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: user?.id,
          consultantId: selectedConsultant.id,
          hospitalId: user?.hospitalId,
          department: department || 'General',
          scheduledAt,
          durationMinutes: duration,
          topic: topic.trim(),
          notes: notes.trim() || null,
          // All-day support
          isAllDay,
          allDayStartTime: isAllDay ? allDayStartTime : undefined,
          allDayEndTime: isAllDay ? allDayEndTime : undefined,
          // Recurring sessions
          isRecurring,
          recurrencePattern: isRecurring ? recurrencePattern : undefined,
          recurrenceDays: isRecurring && recurrencePattern !== 'daily' && recurrencePattern !== 'monthly'
            ? recurrenceDays.join(',')
            : undefined,
          recurrenceEndDate: isRecurring ? recurrenceEndDate : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to schedule session');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Scheduled!</h2>
        <p className="text-gray-500 mb-6">
          Your session with {selectedConsultant?.name} has been scheduled for{' '}
          {formatDate(selectedDate)} at {selectedTime}.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/support/my-schedule')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            View My Schedule
          </button>
          <button
            onClick={() => {
              setSuccess(false);
              setStep(1);
              setSelectedConsultant(null);
              setSelectedTime('');
              setTopic('');
              setNotes('');
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Schedule Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Schedule a Session</h1>
        <p className="text-gray-500 mt-1">
          Book a support session with a consultant in advance
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step >= s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-24 h-1 ${
                  step > s ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Step 1: Select Consultant */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select a Consultant
          </h2>
          <div className="space-y-3">
            {consultants.map(consultant => (
              <button
                key={consultant.id}
                onClick={() => {
                  setSelectedConsultant(consultant);
                  setStep(2);
                }}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary-300 ${
                  selectedConsultant?.id === consultant.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{consultant.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {consultant.specialties.slice(0, 3).map(s => (
                        <span
                          key={s.department}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          {s.department}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{selectedConsultant?.name}</p>
              <p className="text-sm text-gray-500">Select date and time</p>
            </div>
          </div>

          {/* Session Type Toggle */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => { setIsAllDay(false); setSelectedTime(''); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                !isAllDay
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium">Time Slot</span>
            </button>
            <button
              onClick={() => { setIsAllDay(true); setSelectedTime(''); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                isAllDay
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="font-medium">All-Day Support</span>
            </button>
          </div>

          {/* Date selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>
              <button
                onClick={() => changeDate(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* All-Day Time Range */}
          {isAllDay && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3 text-amber-800">
                <Sun className="w-5 h-5" />
                <span className="font-medium">Dedicated All-Day Support</span>
              </div>
              <p className="text-sm text-amber-700 mb-4">
                The consultant will be dedicated to your team for the entire time range.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <select
                    value={allDayStartTime}
                    onChange={e => setAllDayStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {TIME_SLOTS.slice(0, -1).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <select
                    value={allDayEndTime}
                    onChange={e => setAllDayEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {TIME_SLOTS.slice(1).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Duration selector - only for time slots */}
          {!isAllDay && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <div className="flex gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => {
                      setDuration(d.value);
                      setSelectedTime('');
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      duration === d.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time slots - only for regular sessions */}
          {!isAllDay && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Times
              </label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map(time => {
                  const available = isSlotAvailable(time);
                  return (
                    <button
                      key={time}
                      onClick={() => available && setSelectedTime(time)}
                      disabled={!available}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTime === time
                          ? 'bg-primary-600 text-white'
                          : available
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recurring Option */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Make this a recurring session</span>
              </div>
            </label>

            {isRecurring && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {RECURRENCE_PATTERNS.map(p => (
                      <button
                        key={p.value}
                        onClick={() => setRecurrencePattern(p.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          recurrencePattern === p.value
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(recurrencePattern === 'weekly' || recurrencePattern === 'biweekly') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      On these days
                    </label>
                    <div className="flex gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <button
                          key={day.value}
                          onClick={() => {
                            if (recurrenceDays.includes(day.value)) {
                              setRecurrenceDays(recurrenceDays.filter(d => d !== day.value));
                            } else {
                              setRecurrenceDays([...recurrenceDays, day.value].sort());
                            }
                          }}
                          className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                            recurrenceDays.includes(day.value)
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End recurring on
                  </label>
                  <input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={e => setRecurrenceEndDate(e.target.value)}
                    min={selectedDate.toISOString().split('T')[0]}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => (isAllDay || selectedTime) && setStep(3)}
            disabled={!isAllDay && !selectedTime}
            className="w-full mt-6 px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {/* Summary */}
          <div className="bg-primary-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedConsultant?.name}</p>
                <div className="flex items-center gap-2 text-sm text-primary-700">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedDate)}
                  <Clock className="w-4 h-4 ml-2" />
                  {selectedTime} ({duration} min)
                </div>
              </div>
            </div>
          </div>

          {/* Department */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">General</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="What do you need help with?"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !topic.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                Schedule Session
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
