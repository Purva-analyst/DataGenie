import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Pricing: React.FC = () => {
  const { user, updatePlan } = useAuth();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: ['1 CSV Upload / Day', 'Basic Charts (Bar, Line)', 'Limited AI Summaries', 'Community Support'],
      missing: ['PDF Export', 'Advanced Forecasting', 'Priority Server'],
      color: 'slate',
      id: 'free'
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      features: ['Unlimited Uploads', 'All Chart Types', 'Full AI Insights', 'PDF Export', 'Priority Support'],
      missing: ['Team Collaboration', 'Custom API'],
      color: 'indigo',
      popular: true,
      id: 'pro'
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      features: ['Everything in Pro', 'Team Collaboration', 'Custom AI Models', 'API Access', 'Dedicated Account Manager'],
      missing: [],
      color: 'purple',
      id: 'pro_plus'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">Choose the plan that fits your data needs. Unlock the full potential of your analytics with Pro.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative flex flex-col ${plan.popular ? 'border-indigo-500 shadow-indigo-900/20 shadow-2xl scale-105 z-10' : 'border-slate-800'}`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-slate-300 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-500">{plan.period}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              {plan.features.map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="bg-emerald-500/10 p-1 rounded-full">
                    <Check size={14} className="text-emerald-500" />
                  </div>
                  {f}
                </div>
              ))}
              {plan.missing.map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="bg-slate-800 p-1 rounded-full">
                    <X size={14} className="text-slate-600" />
                  </div>
                  {f}
                </div>
              ))}
            </div>

            <Button 
              fullWidth 
              variant={plan.popular ? 'primary' : 'secondary'}
              onClick={() => updatePlan(plan.id as any)}
              disabled={user?.plan === plan.id}
            >
              {user?.plan === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};