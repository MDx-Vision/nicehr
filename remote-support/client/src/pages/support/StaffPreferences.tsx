import { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import {
  Star,
  StarOff,
  User,
  Loader2,
  CheckCircle,
  Search,
} from 'lucide-react';

interface Consultant {
  id: number;
  name: string;
  email: string;
  status: 'online' | 'available' | 'busy' | 'away' | 'offline';
  specialties: Array<{ department: string; proficiency: 'standard' | 'expert' }>;
}

interface Preference {
  consultantId: number;
  consultantName: string;
  consultantEmail: string;
  status: string;
  specialties: Array<{ department: string; proficiency: string }>;
  successfulSessions: number;
  avgRating: number | null;
  lastSessionAt: string | null;
  isFavorite: boolean;
}

export default function StaffPreferences() {
  const { user } = useAuth();
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all consultants and user's preferences
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consultantsRes, prefsRes] = await Promise.all([
          fetch('/api/consultants'),
          fetch(`/api/consultants/preferences/${user?.id}`),
        ]);

        const consultantsData = await consultantsRes.json();
        const prefsData = await prefsRes.json();

        setConsultants(consultantsData);
        setPreferences(prefsData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const isFavorite = (consultantId: number) => {
    return preferences.some(p => p.consultantId === consultantId);
  };

  const toggleFavorite = async (consultant: Consultant) => {
    setSaving(consultant.id);

    try {
      if (isFavorite(consultant.id)) {
        // Remove favorite
        await fetch(`/api/consultants/preferences/${user?.id}/${consultant.id}`, {
          method: 'DELETE',
        });
        setPreferences(prev => prev.filter(p => p.consultantId !== consultant.id));
      } else {
        // Add favorite
        await fetch(`/api/consultants/preferences/${user?.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consultantId: consultant.id }),
        });
        setPreferences(prev => [
          ...prev,
          {
            consultantId: consultant.id,
            consultantName: consultant.name,
            consultantEmail: consultant.email,
            status: consultant.status,
            specialties: consultant.specialties,
            successfulSessions: 0,
            avgRating: null,
            lastSessionAt: null,
            isFavorite: true,
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to update preference:', err);
    } finally {
      setSaving(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'away':
        return 'bg-yellow-500';
      case 'online':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  const filteredConsultants = consultants.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.specialties.some(s => s.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort: favorites first, then by name
  const sortedConsultants = [...filteredConsultants].sort((a, b) => {
    const aFav = isFavorite(a.id);
    const bFav = isFavorite(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Preferred Consultants</h1>
        <p className="text-gray-500 mt-1">
          Mark consultants as favorites to prioritize them when requesting support.
          The system will try to match you with your preferred consultants first.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or department..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Favorites summary */}
      {preferences.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-primary-700">
            <Star className="w-5 h-5 fill-primary-500" />
            <span className="font-medium">
              {preferences.length} favorite consultant{preferences.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-sm text-primary-600 mt-1">
            These consultants will be prioritized when matching your support requests.
          </p>
        </div>
      )}

      {/* Consultants list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {sortedConsultants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No consultants found matching your search.
            </div>
          ) : (
            sortedConsultants.map(consultant => {
              const favorite = isFavorite(consultant.id);
              const pref = preferences.find(p => p.consultantId === consultant.id);

              return (
                <div
                  key={consultant.id}
                  className={`p-4 flex items-center gap-4 transition-colors ${
                    favorite ? 'bg-primary-50/50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor(
                        consultant.status
                      )}`}
                      title={consultant.status}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{consultant.name}</h3>
                      {favorite && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                          <Star className="w-3 h-3 fill-primary-500" />
                          Favorite
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{consultant.email}</p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {consultant.specialties.slice(0, 4).map(spec => (
                        <span
                          key={spec.department}
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            spec.proficiency === 'expert'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {spec.department}
                          {spec.proficiency === 'expert' && ' *'}
                        </span>
                      ))}
                      {consultant.specialties.length > 4 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                          +{consultant.specialties.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Session history with this consultant */}
                    {pref && pref.successfulSessions > 0 && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {pref.successfulSessions} session{pref.successfulSessions !== 1 ? 's' : ''}
                        </span>
                        {pref.avgRating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {pref.avgRating.toFixed(1)} avg
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Toggle favorite button */}
                  <button
                    onClick={() => toggleFavorite(consultant)}
                    disabled={saving === consultant.id}
                    className={`p-2 rounded-lg transition-colors ${
                      favorite
                        ? 'text-primary-600 hover:bg-primary-100'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                    title={favorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {saving === consultant.id ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : favorite ? (
                      <Star className="w-6 h-6 fill-primary-500" />
                    ) : (
                      <StarOff className="w-6 h-6" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Help text */}
      <p className="mt-4 text-sm text-gray-500 text-center">
        * indicates expert-level proficiency in that department
      </p>
    </div>
  );
}
