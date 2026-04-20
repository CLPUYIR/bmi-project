export type Gesture = 
  | 'Rest' 
  // Exercise B: Basic Movements
  | 'Fist' 
  | 'Open Hand' 
  | 'Wrist Flexion' 
  | 'Wrist Extension' 
  | 'Wrist Pronation' 
  | 'Wrist Supination' 
  | 'Wrist Radial Deviation' 
  | 'Wrist Ulnar Deviation'
  // Exercise C: Grasping & Functional
  | 'Point' 
  | 'Peace' 
  | 'Thumbs Up' 
  | 'Tripod Grasp' 
  | 'Power Grasp' 
  | 'Lateral Grasp' 
  | 'Index Extension' 
  | 'Middle Extension' 
  | 'Ring Extension' 
  | 'Pinky Extension' 
  | 'Abduction' 
  | 'Adduction'
  | 'Cylindrical Grasp'
  | 'Spherical Grasp'
  | 'Pinch Grasp'
  | 'Hook Grasp'
  | 'Index Flexion'
  | 'Middle Flexion'
  | 'Ring Flexion'
  | 'Pinky Flexion'
  | 'Thumb Flexion'
  | 'Thumb Extension'
  | 'Thumb Abduction'
  | 'Thumb Adduction'
  | 'Finger Spread'
  | 'Ring-Pinky Flexion'
  | 'Index-Middle Flexion'
  | 'Wrist Circle'
  | 'Scissor'
  | 'Okay Sign'
  | 'Rock On'
  | 'Vulcan Salute'
  | 'Crossed Fingers';

export interface EMGDataPoint {
  timestamp: number;
  channel1: number;
  channel2: number;
  channel3: number;
  channel4: number;
  channel5: number;
  channel6: number;
  channel7: number;
  channel8: number;
}

export interface GestureState {
  gesture: Gesture;
  confidence: number;
}
