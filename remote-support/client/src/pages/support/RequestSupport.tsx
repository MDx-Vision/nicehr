import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { Headphones, AlertCircle, Loader2 } from 'lucide-react';

const DEPARTMENTS = [
  'ER',
  'Pharmacy',
  'Radiology',
  'Lab',
  'IT',
  'Build',
  'Registration',
  'Billing',
  'Nursing',
  'Surgery',
  'ICU',
  'Outpatient',
];

export default function RequestSupport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [department, setDepartment] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'critical'>('normal');
  const [issueSummary, setIssueSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check for existing session
  useEffect(() => {
    fetch(`/api/support/active?userId=${user?.id}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          navigate(`/support/call/${data.id}`);
        }
      })
      .catch(console.error);
  }, [user?.id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!department || !issueSummary.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/support/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: user?.id,
          requesterName: user?.name,
          hospitalId: user?.hospitalId,
          department,
          urgency,
          issueSummary: issueSummary.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create support request');
        setSubmitting(false);
        return;
      }

      // Navigate to the call page
      navigate(`/support/call/${data.sessionId}`);

    } catch (err) {
      console.error('Failed to submit request:', err);
      setError('Failed to connect to server');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
          <Headphones className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Request Support</h1>
        <p className="text-gray-500 mt-1">
          Connect with a NICEHR consultant for instant help
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">Select a department...</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            We'll connect you with a consultant who specializes in this area
          </p>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Urgency Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'normal', label: 'Normal', desc: 'Standard support' },
              { value: 'urgent', label: 'Urgent', desc: 'Needs quick attention' },
              { value: 'critical', label: 'Critical', desc: 'Blocking patient care' },
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setUrgency(option.value as typeof urgency)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  urgency === option.value
                    ? option.value === 'critical'
                      ? 'border-red-500 bg-red-50'
                      : option.value === 'urgent'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">{option.label}</p>
                <p className="text-sm text-gray-500">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Issue Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe Your Issue <span className="text-red-500">*</span>
          </label>
          <textarea
            value={issueSummary}
            onChange={e => setIssueSummary(e.target.value)}
            placeholder="Brief description of what you need help with..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            The more detail you provide, the better we can help
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Headphones className="w-5 h-5" />
              Request Support
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          You'll be connected with an available consultant instantly, or placed in a queue if all consultants are busy.
        </p>
      </form>
    </div>
  );
}
