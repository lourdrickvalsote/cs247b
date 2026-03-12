export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatMinutes(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    stretching: 'Stretching',
    breathing: 'Breathing',
    mindfulness: 'Mindfulness',
    movement: 'Movement',
    eye_rest: 'Eye Rest',
  };
  return labels[category] ?? category;
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    stretching: 'forest',
    breathing: 'powder',
    mindfulness: 'lilac',
    movement: 'jet',
    eye_rest: 'alice',
  };
  return colors[category] ?? 'default';
}

export function getCategoryStyles(category: string) {
  const color = getCategoryColor(category);
  const map: Record<string, { bg: string; text: string; iconBg: string; badgeVariant: string; hex: string }> = {
    forest: { bg: 'bg-forest-50', text: 'text-forest', iconBg: 'bg-forest-100 dark:bg-forest-900/40', badgeVariant: 'forest', hex: '#2E6F40' },
    powder: { bg: 'bg-powder-50', text: 'text-powder-700 dark:text-powder-300', iconBg: 'bg-powder-200 dark:bg-powder-900/40', badgeVariant: 'powder', hex: '#B8C5D6' },
    lilac:  { bg: 'bg-lilac-50', text: 'text-lilac-600 dark:text-lilac-400', iconBg: 'bg-lilac-100 dark:bg-lilac-950/40', badgeVariant: 'lilac', hex: '#A39BA8' },
    jet:    { bg: 'bg-jet-50', text: 'text-jet-600 dark:text-jet-300', iconBg: 'bg-jet-100 dark:bg-jet-800', badgeVariant: 'jet', hex: '#272D2D' },
    alice:  { bg: 'bg-alice-100', text: 'text-alice-700 dark:text-alice-300', iconBg: 'bg-alice-200 dark:bg-alice-950/40', badgeVariant: 'alice', hex: '#4192d4' },
  };
  return map[color] ?? map.forest;
}
