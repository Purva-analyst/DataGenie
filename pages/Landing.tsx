import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, BarChart3, BrainCircuit, Shield, ArrowRight, UploadCloud, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-600/20">
              <Database size={24} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">DataGenie</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
               <Link to="/dashboard">
                 <Button variant="secondary" className="border-slate-700">Go to Dashboard</Button>
               </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block">
                  Sign In
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-[20%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-medium text-indigo-400 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            v2.0 Now Available with Gemini AI
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 leading-tight">
            Turn messy data into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Actionable Insights</span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your CSV or Excel files and let our AI-powered engine generate charts, 
            detect trends, and write executive summaries in seconds. No coding required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8 h-14 text-lg" onClick={handleGetStarted}>
              {user ? 'Go to Dashboard' : 'Start Analyzing Free'} 
              <ArrowRight className="ml-2" size={20} />
            </Button>
            {!user && (
              <Link to="/login" className="px-8 py-4 text-slate-400 hover:text-white font-medium transition-colors">
                Existing User? Sign In
              </Link>
            )}
          </div>

          {/* Fake Dashboard Preview */}
          <div className="mt-20 relative mx-auto max-w-4xl">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-20 h-full w-full pointer-events-none" />
            <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl shadow-indigo-900/20 bg-slate-900/50 backdrop-blur-sm">
               <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                 <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
               </div>
               <div className="p-8 grid grid-cols-3 gap-6 opacity-80">
                 <div className="col-span-1 h-32 bg-slate-800/50 rounded-lg animate-pulse" />
                 <div className="col-span-1 h-32 bg-slate-800/50 rounded-lg animate-pulse delay-75" />
                 <div className="col-span-1 h-32 bg-slate-800/50 rounded-lg animate-pulse delay-150" />
                 <div className="col-span-2 h-48 bg-slate-800/50 rounded-lg animate-pulse delay-100" />
                 <div className="col-span-1 h-48 bg-slate-800/50 rounded-lg animate-pulse delay-200" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-900/30 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Everything you need to understand data</h2>
            <p className="text-slate-400">Powerful features wrapped in a simple, elegant interface.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<UploadCloud size={32} className="text-indigo-400" />}
              title="Instant Visualization"
              description="Drop a file and instantly see bar charts, scatter plots, and correlation matrices generated automatically."
            />
            <FeatureCard 
              icon={<BrainCircuit size={32} className="text-purple-400" />}
              title="AI Summaries"
              description="Our Gemini-powered AI reads your data and writes executive summaries, finding outliers and trends for you."
            />
            <FeatureCard 
              icon={<Shield size={32} className="text-emerald-400" />}
              title="Secure & Private"
              description="Your data is processed locally in your browser session and never stored permanently on our servers."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10k+</div>
              <div className="text-slate-500 text-sm">Reports Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">500MB</div>
              <div className="text-slate-500 text-sm">Max File Size</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">0s</div>
              <div className="text-slate-500 text-sm">Setup Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">4.9/5</div>
              <div className="text-slate-500 text-sm">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/10" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to see the unseen?</h2>
          <p className="text-lg text-slate-400 mb-8">Join thousands of data analysts and business owners making better decisions.</p>
          <Button size="lg" className="px-12 h-14 text-lg shadow-xl shadow-indigo-600/20" onClick={handleGetStarted}>
            <Zap className="mr-2" /> Start Analyzing Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-lg">
              <Database size={20} className="text-slate-400" />
            </div>
            <span className="font-bold text-lg text-slate-300">DataGenie</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-slate-600 text-sm">
            © 2024 DataInsight Genie. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-8 rounded-2xl bg-slate-800/20 border border-slate-700/50 hover:bg-slate-800/40 transition-colors">
    <div className="mb-6 bg-slate-900/50 w-16 h-16 rounded-xl flex items-center justify-center border border-slate-700/50">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">
      {description}
    </p>
  </div>
);
