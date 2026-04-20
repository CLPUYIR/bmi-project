import { EMGDataPoint, Gesture } from '../types';

// Feature set for a window of EMG data
export interface EMGFeatures {
  mav: number[]; // Mean Absolute Value
  rms: number[]; // Root Mean Square
  wl: number[];  // Waveform Length
  zc: number[];  // Zero Crossings
}

// Extract features from a window of EMG data
export const extractFeatures = (window: EMGDataPoint[]): EMGFeatures => {
  const numChannels = 8;
  const mav = new Array(numChannels).fill(0);
  const rms = new Array(numChannels).fill(0);
  const wl = new Array(numChannels).fill(0);
  const zc = new Array(numChannels).fill(0);

  if (window.length === 0) return { mav, rms, wl, zc };

  for (let ch = 0; ch < numChannels; ch++) {
    const channelKey = `channel${ch + 1}` as keyof EMGDataPoint;
    let sumAbs = 0;
    let sumSq = 0;
    let length = 0;
    let crossings = 0;

    for (let i = 0; i < window.length; i++) {
      const val = window[i][channelKey] as number;
      sumAbs += Math.abs(val);
      sumSq += val * val;

      if (i > 0) {
        const prevVal = window[i - 1][channelKey] as number;
        length += Math.abs(val - prevVal);
        // Zero crossing detection with a small deadband to avoid noise-only crossings
        if ((val > 0.05 && prevVal < -0.05) || (val < -0.05 && prevVal > 0.05)) {
          crossings++;
        }
      }
    }

    mav[ch] = sumAbs / window.length;
    rms[ch] = Math.sqrt(sumSq / window.length);
    wl[ch] = length;
    zc[ch] = crossings;
  }

  return { mav, rms, wl, zc };
};

// Simulate EMG noise and signal based on a gesture
export const generateEMGData = (gesture: Gesture, prevData: EMGDataPoint[]): EMGDataPoint => {
  const timestamp = Date.now();
  
  // Base muscle activity at rest (low level noise)
  const getBaseActivity = () => (Math.random() - 0.5) * 0.8;
  
  // Distinct muscle activation patterns for each gesture
  // These represent the relative intensity across 8 electrodes
  const multipliers: Record<Gesture, number[]> = {
    'Rest': [1, 1, 1, 1, 1, 1, 1, 1],
    'Fist': [25, 20, 15, 10, 8, 5, 2, 2],
    'Open Hand': [2, 2, 5, 8, 12, 18, 22, 25],
    'Wrist Flexion': [30, 25, 2, 2, 2, 2, 2, 2],
    'Wrist Extension': [2, 2, 2, 2, 2, 2, 25, 30],
    'Wrist Pronation': [15, 15, 15, 2, 2, 2, 2, 2],
    'Wrist Supination': [2, 2, 2, 2, 2, 15, 15, 15],
    'Wrist Radial Deviation': [20, 2, 2, 2, 2, 2, 2, 20],
    'Wrist Ulnar Deviation': [2, 2, 20, 20, 2, 2, 2, 2],
    'Point': [30, 5, 2, 2, 2, 2, 2, 2],
    'Peace': [20, 20, 2, 2, 2, 2, 2, 2],
    'Thumbs Up': [2, 2, 2, 2, 2, 2, 30, 30],
    'Tripod Grasp': [15, 15, 15, 5, 5, 5, 5, 5],
    'Power Grasp': [25, 25, 25, 25, 25, 25, 25, 25],
    'Lateral Grasp': [10, 10, 10, 10, 10, 10, 10, 10],
    'Index Extension': [2, 30, 2, 2, 2, 2, 2, 2],
    'Middle Extension': [2, 2, 30, 2, 2, 2, 2, 2],
    'Ring Extension': [2, 2, 2, 30, 2, 2, 2, 2],
    'Pinky Extension': [2, 2, 2, 2, 30, 2, 2, 2],
    'Abduction': [10, 10, 10, 10, 20, 20, 20, 20],
    'Adduction': [20, 20, 20, 20, 10, 10, 10, 10],
    'Cylindrical Grasp': [22, 22, 22, 22, 10, 10, 10, 10],
    'Spherical Grasp': [18, 18, 18, 18, 18, 18, 18, 18],
    'Pinch Grasp': [28, 28, 2, 2, 2, 2, 2, 2],
    'Hook Grasp': [15, 15, 15, 15, 2, 2, 2, 2],
    'Index Flexion': [25, 2, 2, 2, 2, 2, 2, 2],
    'Middle Flexion': [2, 25, 2, 2, 2, 2, 2, 2],
    'Ring Flexion': [2, 2, 25, 2, 2, 2, 2, 2],
    'Pinky Flexion': [2, 2, 2, 25, 2, 2, 2, 2],
    'Thumb Flexion': [2, 2, 2, 2, 2, 2, 25, 2],
    'Thumb Extension': [2, 2, 2, 2, 2, 2, 2, 25],
    'Thumb Abduction': [2, 2, 2, 2, 2, 2, 15, 15],
    'Thumb Adduction': [15, 15, 2, 2, 2, 2, 2, 2],
    'Finger Spread': [2, 2, 2, 2, 25, 25, 25, 25],
    'Ring-Pinky Flexion': [2, 2, 2, 20, 20, 2, 2, 2],
    'Index-Middle Flexion': [20, 20, 2, 2, 2, 2, 2, 2],
    'Wrist Circle': [12, 12, 12, 12, 12, 12, 12, 12],
    'Scissor': [22, 22, 2, 2, 2, 2, 2, 2],
    'Okay Sign': [25, 25, 2, 2, 2, 2, 2, 2],
    'Rock On': [25, 2, 2, 2, 25, 2, 2, 2],
    'Vulcan Salute': [20, 20, 2, 2, 20, 20, 2, 2],
    'Crossed Fingers': [22, 22, 2, 2, 2, 2, 2, 2],
  };

  const currentMults = multipliers[gesture] || multipliers['Rest'];
  
  // Generate signal with gesture-specific intensity and random variation
  const generateChannel = (idx: number) => {
    const intensity = currentMults[idx];
    const signal = (getBaseActivity() + (Math.random() * 1.2)) * intensity;
    return signal;
  };

  return {
    timestamp,
    channel1: generateChannel(0),
    channel2: generateChannel(1),
    channel3: generateChannel(2),
    channel4: generateChannel(3),
    channel5: generateChannel(4),
    channel6: generateChannel(5),
    channel7: generateChannel(6),
    channel8: generateChannel(7),
  };
};

// Real-time classification logic based on feature extraction
export const classifyGesture = (window: EMGDataPoint[]): { gesture: Gesture; confidence: number } => {
  if (window.length < 5) return { gesture: 'Rest', confidence: 0.5 };
  
  const features = extractFeatures(window);
  const m = features.mav;
  const mavSum = m.reduce((a, b) => a + b, 0);
  
  // Threshold for "Rest" state
  if (mavSum < 1.0) return { gesture: 'Rest', confidence: 0.95 };
  
  // Pattern Recognition Logic (Simulating a trained LDA/k-NN classifier)
  const multipliers: Record<string, number[]> = {
    'Fist': [25, 20, 15, 10, 8, 5, 2, 2],
    'Open Hand': [2, 2, 5, 8, 12, 18, 22, 25],
    'Wrist Flexion': [30, 25, 2, 2, 2, 2, 2, 2],
    'Wrist Extension': [2, 2, 2, 2, 2, 2, 25, 30],
    'Wrist Pronation': [15, 15, 15, 2, 2, 2, 2, 2],
    'Wrist Supination': [2, 2, 2, 2, 2, 15, 15, 15],
    'Wrist Radial Deviation': [20, 2, 2, 2, 2, 2, 2, 20],
    'Wrist Ulnar Deviation': [2, 2, 20, 20, 2, 2, 2, 2],
    'Point': [30, 5, 2, 2, 2, 2, 2, 2],
    'Peace': [20, 20, 2, 2, 2, 2, 2, 2],
    'Thumbs Up': [2, 2, 2, 2, 2, 2, 30, 30],
    'Tripod Grasp': [15, 15, 15, 5, 5, 5, 5, 5],
    'Power Grasp': [25, 25, 25, 25, 25, 25, 25, 25],
    'Lateral Grasp': [10, 10, 10, 10, 10, 10, 10, 10],
    'Index Extension': [2, 30, 2, 2, 2, 2, 2, 2],
    'Middle Extension': [2, 2, 30, 2, 2, 2, 2, 2],
    'Ring Extension': [2, 2, 2, 30, 2, 2, 2, 2],
    'Pinky Extension': [2, 2, 2, 2, 30, 2, 2, 2],
    'Abduction': [10, 10, 10, 10, 20, 20, 20, 20],
    'Adduction': [20, 20, 20, 20, 10, 10, 10, 10],
    'Cylindrical Grasp': [22, 22, 22, 22, 10, 10, 10, 10],
    'Spherical Grasp': [18, 18, 18, 18, 18, 18, 18, 18],
    'Pinch Grasp': [28, 28, 2, 2, 2, 2, 2, 2],
    'Hook Grasp': [15, 15, 15, 15, 2, 2, 2, 2],
    'Index Flexion': [25, 2, 2, 2, 2, 2, 2, 2],
    'Middle Flexion': [2, 25, 2, 2, 2, 2, 2, 2],
    'Ring Flexion': [2, 2, 25, 2, 2, 2, 2, 2],
    'Pinky Flexion': [2, 2, 2, 25, 2, 2, 2, 2],
    'Thumb Flexion': [2, 2, 2, 2, 2, 2, 25, 2],
    'Thumb Extension': [2, 2, 2, 2, 2, 2, 2, 25],
    'Thumb Abduction': [2, 2, 2, 2, 2, 2, 15, 15],
    'Thumb Adduction': [15, 15, 2, 2, 2, 2, 2, 2],
    'Finger Spread': [2, 2, 2, 2, 25, 25, 25, 25],
    'Ring-Pinky Flexion': [2, 2, 2, 20, 20, 2, 2, 2],
    'Index-Middle Flexion': [20, 20, 2, 2, 2, 2, 2, 2],
    'Wrist Circle': [12, 12, 12, 12, 12, 12, 12, 12],
    'Scissor': [22, 22, 2, 2, 2, 2, 2, 2],
    'Okay Sign': [25, 25, 2, 2, 2, 2, 2, 2],
    'Rock On': [25, 2, 2, 2, 25, 2, 2, 2],
    'Vulcan Salute': [20, 20, 2, 2, 20, 20, 2, 2],
    'Crossed Fingers': [22, 22, 2, 2, 2, 2, 2, 2],
  };

  let bestMatch: Gesture = 'Rest';
  let minDistance = Infinity;

  const normM = m.map(v => v / (mavSum || 1));

  Object.entries(multipliers).forEach(([gesture, signature]) => {
    const sigSum = signature.reduce((a, b) => a + b, 0);
    const normSig = signature.map(v => v / (sigSum || 1));
    
    let distance = 0;
    for (let i = 0; i < 8; i++) {
      distance += Math.pow(normM[i] - normSig[i], 2);
    }
    
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = gesture as Gesture;
    }
  });

  const confidence = Math.max(0.1, 1 - Math.sqrt(minDistance));
  return { gesture: bestMatch, confidence };
};
