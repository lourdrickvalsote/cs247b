import {
  CircleDot,
  Move,
  StretchHorizontal,
  Square,
  Wind,
  Cloud,
  ScanLine,
  Heart,
  Footprints,
  Zap,
  Eye,
  ScanEye,
  Activity,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'circle-dot': CircleDot,
  'move': Move,
  'stretch-horizontal': StretchHorizontal,
  'square': Square,
  'wind': Wind,
  'cloud': Cloud,
  'scan-line': ScanLine,
  'heart': Heart,
  'footprints': Footprints,
  'zap': Zap,
  'eye': Eye,
  'scan-eye': ScanEye,
  'activity': Activity,
};

export function getActivityIcon(name: string): LucideIcon {
  return iconMap[name] ?? Activity;
}
