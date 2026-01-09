
export enum WasteSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum WasteType {
  PLASTIC = 'PLASTIC',
  ORGANIC = 'ORGANIC',
  METAL = 'METAL',
  ELECTRONIC = 'ELECTRONIC',
  CONSTRUCTION = 'CONSTRUCTION',
  HAZARDOUS = 'HAZARDOUS',
  OTHER = 'OTHER'
}

export interface WasteAnalysis {
  type: WasteType;
  severity: WasteSeverity;
  description: string;
  estimatedVolume: string;
  actionRequired: string;
}

export interface WasteReport {
  id: string;
  timestamp: number;
  imageUrl?: string;
  userDescription: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  analysis?: WasteAnalysis;
  status: 'PENDING' | 'ANALYZING' | 'REPORTED';
}
