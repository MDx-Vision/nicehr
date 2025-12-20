import { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import {
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Specialty {
  department: string;
  proficiency: 'standard' | 'expert';
}

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

export default function ConsultantSettings() {
  const { user } = useAuth();
  
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch current specialties
  useEffect(() => {
    fetch(`/api/consultants/${user?.id}/specialties`)
      .then(res => res.json())
      .then(data => {
        setSpecialties(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load specialties:', err);
        setLoading(false);
      });
  }, [user?.id]);

  const getSpecialtyLevel = (department: string): 'none' | 'standard' | 'expert' => {
    const spec = specialties.find(s => s.department === department);
    return spec?.proficiency || 'none';
  };

  const toggleSpecialty = (department: string, level: 'none' | 'standard' | 'expert') => {
    setSpecialties(prev => {
      // Remove existing specialty for this department
      const filtered = prev.filter(s => s.department !== department);
      
      // Add new level if not "none"
      if (level !== 'none') {
        return [...filtered, { department, proficiency: level }];
      }
      
      return filtered;
    });
    
    setMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/consultants/${user?.id}/specialties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialties }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Specialties saved successfully!' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error('Failed to save specialties:', err);
      setMessage({ type: 'error', text: 'Failed to save specialties. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consultant Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your department specialties and expertise levels
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' 
            ? <CheckCircle className="w-5 h-5" />
            : <AlertCircle className="w-5 h-5" />
          }
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Specialties */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Department Specialties</h2>
          <p className="text-sm text-gray-500 mt-1">
            Set your proficiency level for each department. Expert levels will be prioritized in matching.
          </p>
        </div>

        <div className="p-6">
          <div className="grid gap-4">
            {DEPARTMENTS.map(dept => {
              const level = getSpecialtyLevel(dept);
              
              return (
                <div
                  key={dept}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <span className="font-medium text-gray-900">{dept}</span>
                  
                  <div className="flex gap-2">
                    {(['none', 'standard', 'expert'] as const).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => toggleSpecialty(dept, lvl)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          level === lvl
                            ? lvl === 'expert'
                              ? 'bg-primary-600 text-white'
                              : lvl === 'standard'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {lvl === 'none' ? 'None' : lvl === 'standard' ? 'Standard' : 'Expert'}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Proficiency Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">None:</span>
            <p className="text-gray-500">Not trained in this department</p>
          </div>
          <div>
            <span className="font-medium text-blue-600">Standard:</span>
            <p className="text-gray-500">Can handle common issues</p>
          </div>
          <div>
            <span className="font-medium text-primary-600">Expert:</span>
            <p className="text-gray-500">Deep expertise, prioritized for complex issues</p>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
