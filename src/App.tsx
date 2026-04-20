import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, 
  Hand, 
  Database, 
  Info, 
  Play, 
  Square, 
  Cpu, 
  Zap,
  ChevronRight,
  ExternalLink,
  BrainCircuit,
  Settings,
  Layers,
  BarChart3,
  Terminal
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { EMGDataPoint, Gesture } from './types';
import { generateEMGData, classifyGesture, extractFeatures, EMGFeatures } from './services/emgService';

// --- Sub-components ---

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
    <div className={cn("p-3 rounded-lg", color)}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-white/50 uppercase tracking-wider font-mono">{title}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const HandVisualization = ({ gesture }: { gesture: Gesture }) => {
  const fingers = [
    { id: 0, name: 'Thumb', x: 55, y: 175, h: 65, w: 20 },
    { id: 1, name: 'Index', x: 85, y: 145, h: 85, w: 18 },
    { id: 2, name: 'Middle', x: 109, y: 145, h: 95, w: 18 },
    { id: 3, name: 'Ring', x: 133, y: 145, h: 85, w: 18 },
    { id: 4, name: 'Pinky', x: 157, y: 145, h: 70, w: 18 },
  ];

  const getFingerState = (i: number, gesture: Gesture) => {
    const base = { rotate: 0, scaleY: 1, x: 0, y: 0 };
    
    switch (gesture) {
      case 'Fist':
      case 'Power Grasp':
      case 'Cylindrical Grasp':
      case 'Spherical Grasp':
      case 'Hook Grasp':
        return { rotate: i === 0 ? 45 : 10, scaleY: 0.2 };
      case 'Open Hand':
      case 'Finger Spread':
        const spread = (i - 2) * 15;
        return { rotate: spread, scaleY: 1.1 };
      case 'Point':
        if (i === 1) return { rotate: 0, scaleY: 1.1 };
        return { rotate: i === 0 ? 45 : 20, scaleY: 0.2 };
      case 'Peace':
      case 'Scissor':
        if (i === 1) return { rotate: -15, scaleY: 1.1 };
        if (i === 2) return { rotate: 15, scaleY: 1.1 };
        return { rotate: i === 0 ? 45 : 20, scaleY: 0.2 };
      case 'Thumbs Up':
        if (i === 0) return { rotate: -60, scaleY: 1.1, x: -10 };
        return { rotate: 20, scaleY: 0.2 };
      case 'Tripod Grasp':
      case 'Pinch Grasp':
      case 'Okay Sign':
        if (i === 0 || i === 1) return { rotate: i === 0 ? -30 : 30, scaleY: 0.6 };
        return { rotate: 20, scaleY: 0.2 };
      case 'Lateral Grasp':
        if (i === 0) return { rotate: -40, scaleY: 0.8, x: 5 };
        return { rotate: 10, scaleY: 0.3 };
      case 'Index Extension':
        if (i === 1) return { rotate: 0, scaleY: 1.1 };
        return { rotate: 15, scaleY: 0.2 };
      case 'Middle Extension':
        if (i === 2) return { rotate: 0, scaleY: 1.1 };
        return { rotate: 15, scaleY: 0.2 };
      case 'Ring Extension':
        if (i === 3) return { rotate: 0, scaleY: 1.1 };
        return { rotate: 15, scaleY: 0.2 };
      case 'Pinky Extension':
        if (i === 4) return { rotate: 0, scaleY: 1.1 };
        return { rotate: 15, scaleY: 0.2 };
      case 'Index Flexion':
        if (i === 1) return { rotate: 10, scaleY: 0.2 };
        return base;
      case 'Middle Flexion':
        if (i === 2) return { rotate: 10, scaleY: 0.2 };
        return base;
      case 'Ring Flexion':
        if (i === 3) return { rotate: 10, scaleY: 0.2 };
        return base;
      case 'Pinky Flexion':
        if (i === 4) return { rotate: 10, scaleY: 0.2 };
        return base;
      case 'Thumb Flexion':
        if (i === 0) return { rotate: 45, scaleY: 0.2 };
        return base;
      case 'Thumb Extension':
        if (i === 0) return { rotate: -45, scaleY: 1.1 };
        return base;
      case 'Abduction':
        return { rotate: (i - 2) * 25, scaleY: 1.1 };
      case 'Adduction':
        return { rotate: 0, scaleY: 1.1 };
      case 'Rock On':
        if (i === 1 || i === 4) return { rotate: 0, scaleY: 1.1 };
        return { rotate: 20, scaleY: 0.2 };
      case 'Vulcan Salute':
        if (i === 1 || i === 2) return { rotate: -15, scaleY: 1.1 };
        if (i === 3 || i === 4) return { rotate: 15, scaleY: 1.1 };
        return { rotate: 45, scaleY: 0.2 };
      case 'Crossed Fingers':
        if (i === 1) return { rotate: 10, x: 5 };
        if (i === 2) return { rotate: -10, x: -5 };
        return base;
      case 'Rest':
      default:
        return base;
    }
  };

  return (
    <div className="relative w-full h-80 flex items-center justify-center bg-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-inner">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full" />
      </div>
      
      <svg width="240" height="280" viewBox="0 0 240 280" className="drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">
        {/* Wrist/Arm base */}
        <rect x="95" y="220" width="50" height="50" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
        
        {/* Palm */}
        <rect x="60" y="140" width="120" height="90" rx="24" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
        
        {/* Fingers */}
        {fingers.map((f) => (
          <motion.g
            key={f.id}
            initial={false}
            animate={getFingerState(f.id, gesture)}
            transition={{ 
              type: 'spring', 
              stiffness: 180, 
              damping: 18,
              delay: f.id * 0.02
            }}
            style={{ 
              originY: `${f.y}px`, 
              originX: `${f.x}px` 
            }}
          >
            <rect
              x={f.x - f.w / 2}
              y={f.y - f.h}
              width={f.w}
              height={f.h}
              rx={9}
              fill="#334155"
              stroke="#60a5fa"
              strokeWidth="2"
            />
          </motion.g>
        ))}
        
        {/* Palm Cover (to hide finger bases) */}
        <rect x="61" y="141" width="118" height="88" rx="23" fill="#1e293b" />
      </svg>

      <div className="absolute bottom-6 left-6 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Actuator Active</span>
      </div>
      
      <div className="absolute top-6 right-6 text-right">
        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Current State</p>
        <p className="text-sm font-bold text-blue-400">{gesture}</p>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isRunning, setIsRunning] = useState(true);
  const [emgHistory, setEmgHistory] = useState<EMGDataPoint[]>([]);
  const [currentGesture, setCurrentGesture] = useState<Gesture>('Rest');
  const [confidence, setConfidence] = useState(0.95);
  const [selectedGesture, setSelectedGesture] = useState<Gesture>('Rest');
  const [activeTab, setActiveTab] = useState<'live' | 'analysis'>('live');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const gestureCategories = [
    {
      name: 'Basic Movements (Ex. B)',
      gestures: [
        'Rest', 'Fist', 'Open Hand', 'Wrist Flexion', 'Wrist Extension', 
        'Wrist Pronation', 'Wrist Supination', 'Wrist Radial Deviation', 'Wrist Ulnar Deviation',
        'Wrist Circle'
      ] as Gesture[]
    },
    {
      name: 'Grasping & Functional (Ex. C)',
      gestures: [
        'Point', 'Peace', 'Thumbs Up', 'Tripod Grasp', 'Power Grasp', 'Lateral Grasp',
        'Cylindrical Grasp', 'Spherical Grasp', 'Pinch Grasp', 'Hook Grasp',
        'Index Extension', 'Middle Extension', 'Ring Extension', 'Pinky Extension',
        'Index Flexion', 'Middle Flexion', 'Ring Flexion', 'Pinky Flexion',
        'Thumb Flexion', 'Thumb Extension', 'Thumb Abduction', 'Thumb Adduction',
        'Abduction', 'Adduction', 'Finger Spread', 'Ring-Pinky Flexion', 'Index-Middle Flexion',
        'Scissor', 'Okay Sign', 'Rock On', 'Vulcan Salute', 'Crossed Fingers'
      ] as Gesture[]
    }
  ];

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setEmgHistory(prev => {
          const newData = generateEMGData(selectedGesture, prev);
          const updated = [...prev, newData];
          if (updated.length > 50) return updated.slice(1);
          return updated;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, selectedGesture]);

  // Separate effect for classification to ensure clean state propagation
  useEffect(() => {
    if (emgHistory.length >= 10) {
      const window = emgHistory.slice(-10);
      const classification = classifyGesture(window);
      setCurrentGesture(classification.gesture);
      setConfidence(classification.confidence);
    } else {
      setCurrentGesture('Rest');
      setConfidence(0.99);
    }
  }, [emgHistory]);

  const features = useMemo(() => extractFeatures(emgHistory.slice(-10)), [emgHistory]);

  const featureData = useMemo(() => {
    return features.mav.map((val, i) => ({
      channel: `CH${i + 1}`,
      mav: val,
      rms: features.rms[i],
      wl: features.wl[i],
      zc: features.zc[i]
    }));
  }, [features]);

  const gestures: Gesture[] = ['Rest', 'Fist', 'Open Hand', 'Point', 'Peace', 'Thumbs Up'];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-6 flex justify-between items-center bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <BrainCircuit size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Bionic Control Lab</h1>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">EMG Pattern Recognition System</p>
          </div>
        </div>
        
        <nav className="hidden md:flex bg-white/5 border border-white/10 rounded-full p-1">
          <button 
            onClick={() => setActiveTab('live')}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold transition-all",
              activeTab === 'live' ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
            )}
          >
            LIVE CONTROL
          </button>
          <button 
            onClick={() => setActiveTab('analysis')}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold transition-all",
              activeTab === 'analysis' ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
            )}
          >
            MODEL ANALYSIS
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all",
              isRunning 
                ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" 
                : "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
            )}
          >
            {isRunning ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {isRunning ? "Stop Stream" : "Start Stream"}
          </button>
          <div className="h-8 w-px bg-white/10 mx-2" />
          <a 
            href="http://ninapro.hevs.ch" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white transition-colors flex items-center gap-1 text-xs font-mono"
          >
            NINAPRO DB <ExternalLink size={12} />
          </a>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'live' ? (
            <motion.div 
              key="live"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-8"
            >
              {/* Left Column: Controls & Stats */}
              <div className="col-span-12 lg:col-span-3 space-y-8">
                <section className="space-y-4">
                  <h2 className="text-xs font-mono text-white/30 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} /> Input Simulation
                  </h2>
                  <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    {gestureCategories.map((cat) => (
                      <div key={cat.name} className="space-y-2">
                        <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">{cat.name}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {cat.gestures.map((g) => (
                            <button
                              key={g}
                              onClick={() => setSelectedGesture(g)}
                              className={cn(
                                "px-3 py-2.5 rounded-xl border text-[11px] font-medium transition-all text-left flex flex-col gap-0.5",
                                selectedGesture === g 
                                  ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
                              )}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xs font-mono text-white/30 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} /> Real-time Metrics
                  </h2>
                  <div className="space-y-3">
                    <StatCard 
                      title="Classification" 
                      value={currentGesture} 
                      icon={Hand} 
                      color="bg-blue-500" 
                    />
                    <StatCard 
                      title="Confidence" 
                      value={`${(confidence * 100).toFixed(1)}%`} 
                      icon={Cpu} 
                      color="bg-purple-500" 
                    />
                    <StatCard 
                      title="Sample Rate" 
                      value="10 Hz" 
                      icon={Activity} 
                      color="bg-emerald-500" 
                    />
                  </div>
                </section>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 relative overflow-hidden group">
                  <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <BrainCircuit size={120} />
                  </div>
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    Pattern Recognition
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    The system uses a simulated Linear Discriminant Analysis (LDA) to map multi-channel EMG signals to discrete hand gestures.
                  </p>
                  <button 
                    onClick={() => setActiveTab('analysis')}
                    className="mt-4 text-xs font-bold text-blue-400 flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    View Model Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Middle Column: Visualization */}
              <div className="col-span-12 lg:col-span-6 space-y-8">
                <section className="bg-white/5 border border-white/10 rounded-3xl p-8 relative">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Prosthetic Response</h2>
                      <p className="text-xs text-white/40 font-mono">Bionic Actuator Simulation</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono uppercase tracking-widest">
                      Real-time Sync
                    </div>
                  </div>
                  
                  <HandVisualization gesture={currentGesture} />
                  
                  <div className="mt-8 grid grid-cols-5 gap-4">
                    {['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'].map((finger, i) => (
                      <div key={finger} className="text-center space-y-2">
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500"
                            initial={{ width: '0%' }}
                            animate={{ 
                              width: currentGesture === 'Fist' ? '100%' : 
                                     currentGesture === 'Rest' ? '0%' : 
                                     currentGesture === 'Open Hand' ? '0%' : '50%'
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-white/30 uppercase">{finger}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Activity size={18} className="text-blue-400" /> Multi-Channel EMG Stream
                    </h2>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-blue-500/50" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={emgHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis hide dataKey="timestamp" />
                        <YAxis domain={[0, 10]} hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                          itemStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
                        />
                        <Line type="monotone" dataKey="channel1" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="channel2" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="channel3" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="channel4" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>

              {/* Right Column: Database & Info */}
              <div className="col-span-12 lg:col-span-3 space-y-8">
                <section className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Database size={20} className="text-blue-400" />
                    </div>
                    <h2 className="font-bold">NinaPro Database</h2>
                  </div>
                  
                  <p className="text-sm text-white/60 leading-relaxed">
                    The Non-Invasive Adaptive Prosthetics (NinaPro) database provides benchmarks for EMG-based hand gesture recognition.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-[10px] font-mono text-white/30 uppercase mb-1">Dataset Size</p>
                      <p className="text-sm font-bold">50+ Subjects</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-[10px] font-mono text-white/30 uppercase mb-1">Gesture Count</p>
                      <p className="text-sm font-bold">52 Distinct Movements</p>
                    </div>
                  </div>

                  <a 
                    href="http://ninapro.hevs.ch" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    Access Database <ExternalLink size={14} />
                  </a>
                </section>

                <section className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Info size={20} className="text-purple-400" />
                    </div>
                    <h2 className="font-bold">How it works</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                      <p className="text-xs text-white/60">Electrodes detect electrical activity from muscle fibers.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                      <p className="text-xs text-white/60">Raw signals are filtered and features (MAV, RMS) are extracted.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                      <p className="text-xs text-white/60">ML models classify the pattern into a specific intent.</p>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-8"
            >
              {/* Analysis Header */}
              <div className="col-span-12 flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Layers size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Signal Processing Pipeline</h2>
                    <p className="text-sm text-white/40">Feature extraction and classification architecture</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">
                    Window: 200ms
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">
                    Overlap: 50%
                  </div>
                </div>
              </div>

              {/* Feature Extraction View */}
              <div className="col-span-12 lg:col-span-8 space-y-8">
                <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <BarChart3 size={18} className="text-blue-400" /> Extracted Features (MAV)
                    </h3>
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                      Mean Absolute Value per Channel
                    </div>
                  </div>
                  
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={featureData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="channel" stroke="#ffffff30" fontSize={10} />
                        <YAxis stroke="#ffffff30" fontSize={10} />
                        <Tooltip 
                          cursor={{ fill: '#ffffff05' }}
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                        />
                        <Bar dataKey="mav" radius={[4, 4, 0, 0]}>
                          {featureData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.mav > 3 ? '#3b82f6' : '#1e293b'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-8">
                  <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <Settings size={16} className="text-purple-400" /> Preprocessing Steps
                    </h3>
                    <ul className="space-y-4">
                      {[
                        { label: 'Bandpass Filter', desc: '20-500Hz to remove motion artifacts' },
                        { label: 'Notch Filter', desc: '50/60Hz power line interference removal' },
                        { label: 'Rectification', desc: 'Full-wave rectification of raw signal' },
                        { label: 'Normalization', desc: 'Z-score scaling based on MVC' }
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{step.label}</p>
                            <p className="text-[10px] text-white/40">{step.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <Cpu size={16} className="text-emerald-400" /> Model Selection
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs font-bold text-blue-400">Linear Discriminant Analysis (LDA)</p>
                        <p className="text-[10px] text-white/60 mt-1">Low computational cost, ideal for real-time embedded systems.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs font-bold">Support Vector Machines (SVM)</p>
                        <p className="text-[10px] text-white/40 mt-1">High accuracy for non-linear patterns, requires more memory.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs font-bold">CNN / RNN (Deep Learning)</p>
                        <p className="text-[10px] text-white/40 mt-1">End-to-end learning from raw signals, high latency without GPU.</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* NinaPro Integration Details */}
              <div className="col-span-12 lg:col-span-4 space-y-8">
                <section className="bg-white/5 border border-white/10 rounded-3xl p-8 h-full">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Database size={18} className="text-blue-400" /> NinaPro DB2 Integration
                  </h3>
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs font-bold text-blue-400 mb-1">Dataset Overview</p>
                      <p className="text-[10px] text-white/60 leading-relaxed">
                        NinaPro DB2 contains 49-53 distinct movements from 40 subjects, recorded using 12 Delsys Trigno electrodes.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono text-white/30 uppercase tracking-widest mb-3">Training Pipeline</h4>
                      <div className="space-y-2">
                        {[
                          'MATLAB to CSV conversion',
                          'Windowing (200ms, 100ms overlap)',
                          'Feature Vector Composition (MAV, RMS, WL, ZC)',
                          'Subject-specific normalization',
                          'Train/Test split (70/30)'
                        ].map((step, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-xs">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10">
                      <h4 className="text-xs font-bold mb-2">Technical Documentation</h4>
                      <p className="text-[10px] text-white/60 leading-relaxed mb-4">
                        A comprehensive technical documentation file (DOCUMENTATION.md) has been generated, 
                        detailing the entire process flow from EMG acquisition to bionic actuation.
                      </p>
                      <div className="flex items-center gap-2 p-2 bg-black/40 rounded-lg border border-white/5">
                        <Terminal size={14} className="text-blue-400" />
                        <span className="text-[10px] font-mono text-white/40">View DOCUMENTATION.md in project root</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                      <h4 className="text-xs font-bold mb-2">Real-time Optimization</h4>
                      <p className="text-[10px] text-white/60 leading-relaxed">
                        To achieve minimal latency, we utilize a sliding window approach with a 100ms stride. 
                        The feature extraction is optimized for production environments, 
                        ensuring the entire pipeline remains under the 300ms human-perceptible threshold.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Status Bar */}
      <footer className="border-t border-white/10 px-8 py-4 bg-black/60 backdrop-blur-md flex justify-between items-center fixed bottom-0 w-full z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isRunning ? "bg-green-500 animate-pulse" : "bg-red-500")} />
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">System {isRunning ? "Online" : "Idle"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Latency:</span>
            <span className="text-[10px] font-mono text-blue-400">12ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Active Model:</span>
            <span className="text-[10px] font-mono text-purple-400">LDA-v2.1</span>
          </div>
        </div>
        
        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
          Bionic Control Interface v1.1.0
        </div>
      </footer>
    </div>
  );
}
