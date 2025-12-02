import React from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>
      
      <Card className="mb-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Profile Information</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <User className="text-slate-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-slate-200">Full Name</p>
                    <p className="text-xs text-slate-500">{user?.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <Mail className="text-slate-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-slate-200">Email Address</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
          </div>

          <div>
             <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Subscription</h3>
             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-500/30">
                <div className="flex items-center gap-3">
                  <Shield className="text-indigo-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-white capitalize">{user?.plan} Plan</p>
                    <p className="text-xs text-slate-400">Active since {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <Button variant="primary" size="sm">Manage Subscription</Button>
              </div>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-end">
        <Button variant="danger" onClick={logout}>Sign Out</Button>
      </div>
    </div>
  );
};