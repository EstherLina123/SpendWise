import { useState } from 'react';
import React from 'react';
import { FirebaseProvider, useFirebase } from './components/FirebaseProvider';
import { Home, List, PieChart, Settings, Plus, LogIn, LogOut, Wallet, ArrowUpCircle, ArrowDownCircle, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './screens/Dashboard';
import History from './screens/History';
import Analytics from './screens/Analytics';
import Profile from './screens/Profile';
import Onboarding from './screens/Onboarding';
import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import TransactionModal from './components/TransactionModal';

function AppContent() {
  const { user, loading, profile, logOut, signIn } = useFirebase();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'analytics' | 'profile'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [authScreen, setAuthScreen] = useState<'onboarding' | 'signin' | 'signup'>('onboarding');

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-zinc-500 border-t-white rounded-sm animate-spin" />
          <p className="label-caps">Accessing Vault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authScreen === 'signin') {
      return <SignIn onBack={() => setAuthScreen('onboarding')} onGoToSignUp={() => setAuthScreen('signup')} />;
    }
    if (authScreen === 'signup') {
      return <SignUp onBack={() => setAuthScreen('onboarding')} onGoToSignIn={() => setAuthScreen('signin')} />;
    }
    return <Onboarding onSignIn={() => setAuthScreen('signin')} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col font-sans text-zinc-400 pb-20 md:pb-0 md:pl-64">
      {/* Sidebar for Desktop */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 border-r border-zinc-900 bg-[#0A0A0A] p-8 z-30">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-zinc-100 rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-xs" />
          </div>
          <h1 className="font-bold text-sm tracking-[0.2em] text-white uppercase">Equity.</h1>
        </div>

        <div className="flex flex-col gap-6 flex-grow">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<Home size={18} />} 
            label="Dashboard" 
          />
          <NavButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<List size={18} />} 
            label="History" 
          />
          <NavButton 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')} 
            icon={<PieChart size={18} />} 
            label="Analytics" 
          />
          <NavButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={<Settings size={18} />} 
            label="Settings" 
          />
        </div>

        <div className="mt-auto pt-8 border-t border-zinc-900">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full border border-zinc-800 bg-[#111] flex items-center justify-center text-white italic font-serif">
              {user.displayName?.[0] || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">{user.displayName}</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider truncate">Platinum Tier</span>
            </div>
          </div>
          <button 
            onClick={logOut}
            className="label-caps hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 max-w-6xl mx-auto w-full">
        <header className="flex md:hidden items-center justify-between mb-8 pb-6 border-b border-zinc-900">
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 bg-zinc-100 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-xs" />
              </div>
              <h1 className="font-bold text-xs tracking-[0.2em] text-white uppercase">Equity.</h1>
          </div>
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full border border-zinc-800 p-0.5 overflow-hidden"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-full h-full rounded-full" />
            ) : (
              <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-serif text-white">
                {user.displayName?.[0]}
              </div>
            )}
          </button>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && <Dashboard onAddClick={() => setShowAddModal(true)} />}
            {activeTab === 'history' && <History />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'profile' && <Profile />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-xl border-t border-zinc-900 px-8 flex items-center justify-between z-40">
        <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Home size={20} />} />
        <MobileNavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<List size={20} />} />
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-12 h-12 bg-white text-black rounded flex items-center justify-center -translate-y-8 shadow-2xl active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>

        <MobileNavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<PieChart size={20} />} />
        <MobileNavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<Settings size={20} />} />
      </nav>

      {/* Add Button for Desktop */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="hidden md:flex fixed right-12 bottom-12 px-8 py-3 bg-white text-black rounded-none items-center justify-center shadow-2xl hover:bg-zinc-200 transition-all font-bold text-[10px] uppercase tracking-[0.2em] z-30"
      >
        Add Transaction
      </button>

      {/* Transaction Modal */}
      <TransactionModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full transition-colors font-medium text-sm ${
        active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      <span className={active ? 'text-white' : 'text-zinc-600'}>{icon}</span>
      {label}
    </button>
  );
}

function MobileNavButton({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`transition-colors ${active ? 'text-white' : 'text-zinc-600'}`}
    >
      {icon}
    </button>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}
