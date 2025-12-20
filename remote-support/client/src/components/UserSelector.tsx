import { useState, useEffect } from 'react';
import { User } from '../App';
import { Headphones, User as UserIcon, Building, Shield } from 'lucide-react';

interface UserSelectorProps {
  onSelect: (user: User) => void;
}

export default function UserSelector({ onSelect }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load users:', err);
        setLoading(false);
      });
  }, []);

  const handleSelect = async (userId: number) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const user = await res.json();
    onSelect(user);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5" />;
      case 'consultant':
        return <Headphones className="w-5 h-5" />;
      default:
        return <UserIcon className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'consultant':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'hospital_staff':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'hospital_leadership':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const groupedUsers = users.reduce((acc, user) => {
    const group = user.role;
    if (!acc[group]) acc[group] = [];
    acc[group].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  const roleOrder = ['admin', 'consultant', 'hospital_staff', 'hospital_leadership'];
  const roleLabels: Record<string, string> = {
    admin: 'Administrators',
    consultant: 'Consultants',
    hospital_staff: 'Hospital Staff',
    hospital_leadership: 'Hospital Leadership',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            NICEHR Remote Support
          </h1>
          <p className="text-gray-500">
            Select a user to test the remote support system
          </p>
        </div>

        {/* User groups */}
        <div className="space-y-8">
          {roleOrder.map(role => {
            const roleUsers = groupedUsers[role];
            if (!roleUsers?.length) return null;

            return (
              <div key={role}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {roleLabels[role]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roleUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleSelect(user.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-md hover:scale-[1.02] ${getRoleColor(user.role)}`}
                    >
                      <div className="flex-shrink-0">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm opacity-75">{user.email}</p>
                      </div>
                      {user.hospitalName && (
                        <div className="flex items-center gap-1 text-sm opacity-75">
                          <Building className="w-4 h-4" />
                          {user.hospitalName}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-gray-400 mt-12">
          This is a development environment. In production, users will authenticate via NICEHR.
        </p>
      </div>
    </div>
  );
}
