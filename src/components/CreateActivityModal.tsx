import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { getCategoryStyles, getCategoryLabel } from '../lib/format';
import { getActivityIcon } from '../lib/icons';
import type { BreakActivity, ActivityCategory, ActivityStep } from '../types/database';

const CATEGORIES: ActivityCategory[] = ['stretching', 'breathing', 'mindfulness', 'movement', 'eye_rest'];

const ICON_NAMES = [
  'circle-dot', 'move', 'stretch-horizontal', 'square', 'wind',
  'cloud', 'scan-line', 'heart', 'footprints', 'zap', 'eye', 'scan-eye', 'activity',
];

const emptyStep: ActivityStep = { instruction: '', duration_seconds: 15 };

interface CreateActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    category: ActivityCategory;
    icon_name: string;
    instructions: ActivityStep[];
  }) => void;
  activity?: BreakActivity | null;
}

export default function CreateActivityModal({ open, onClose, onSave, activity }: CreateActivityModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('movement');
  const [iconName, setIconName] = useState('activity');
  const [steps, setSteps] = useState<ActivityStep[]>([{ ...emptyStep }]);

  const isEditing = !!activity;

  useEffect(() => {
    if (open && activity) {
      setTitle(activity.title);
      setDescription(activity.description);
      setCategory(activity.category);
      setIconName(activity.icon_name);
      setSteps(activity.instructions.map((s) => ({ ...s })));
    } else if (open) {
      setTitle('');
      setDescription('');
      setCategory('movement');
      setIconName('activity');
      setSteps([{ ...emptyStep }]);
    }
  }, [open, activity]);

  const totalDuration = steps.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
  const isValid = title.trim().length > 0 && steps.length > 0 && steps.every((s) => s.instruction.trim().length > 0 && s.duration_seconds > 0);

  const updateStep = (index: number, field: keyof ActivityStep, value: string | number) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const addStep = () => setSteps((prev) => [...prev, { ...emptyStep }]);
  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!isValid) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      icon_name: iconName,
      instructions: steps.map((s) => ({
        instruction: s.instruction.trim(),
        duration_seconds: s.duration_seconds,
      })),
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Activity' : 'Create Activity'}>
      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-lilac uppercase tracking-wider mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 60))}
            placeholder="e.g., Pushups"
            className="w-full px-3 py-2.5 rounded-xl border border-powder-200 dark:border-jet-700 bg-white dark:bg-jet-800 text-sm text-jet dark:text-jet-100 placeholder:text-lilac-400 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-colors"
          />
          <p className="text-[10px] text-lilac-400 mt-1 text-right">{title.length}/60</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-lilac uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 200))}
            placeholder="Short description of the activity"
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-powder-200 dark:border-jet-700 bg-white dark:bg-jet-800 text-sm text-jet dark:text-jet-100 placeholder:text-lilac-400 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-colors resize-none"
          />
          <p className="text-[10px] text-lilac-400 mt-1 text-right">{description.length}/200</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-lilac uppercase tracking-wider mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const styles = getCategoryStyles(cat);
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 ${
                    isActive
                      ? `${styles.bg} ${styles.text} border-current shadow-sm`
                      : 'bg-white dark:bg-jet-800 text-jet-600 dark:text-jet-300 border-powder-200 dark:border-jet-700'
                  }`}
                >
                  {getCategoryLabel(cat)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Icon */}
        <div>
          <label className="block text-xs font-semibold text-lilac uppercase tracking-wider mb-2">
            Icon
          </label>
          <div className="grid grid-cols-7 gap-2">
            {ICON_NAMES.map((name) => {
              const Icon = getActivityIcon(name);
              const isActive = iconName === name;
              const styles = getCategoryStyles(category);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setIconName(name)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
                    isActive
                      ? `${styles.bg} ${styles.text} ring-2 ring-current`
                      : 'bg-powder-50 dark:bg-jet-800 text-lilac-500 hover:bg-powder-100 dark:hover:bg-jet-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-lilac uppercase tracking-wider">
              Steps
            </label>
            <span className="text-xs text-lilac-500">
              Total: {Math.ceil(totalDuration / 60)}m {totalDuration % 60}s
            </span>
          </div>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2 items-start animate-slide-up">
                <div className="w-6 h-6 rounded-full bg-powder-100 dark:bg-jet-700 flex items-center justify-center shrink-0 mt-2.5">
                  <span className="text-[10px] font-bold text-lilac-600">{i + 1}</span>
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={step.instruction}
                    onChange={(e) => updateStep(i, 'instruction', e.target.value)}
                    placeholder="Step instruction"
                    className="w-full px-3 py-2 rounded-xl border border-powder-200 dark:border-jet-700 bg-white dark:bg-jet-800 text-sm text-jet dark:text-jet-100 placeholder:text-lilac-400 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-colors"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={step.duration_seconds}
                      onChange={(e) => updateStep(i, 'duration_seconds', Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      className="w-20 px-2 py-1.5 rounded-lg border border-powder-200 dark:border-jet-700 bg-white dark:bg-jet-800 text-xs text-jet dark:text-jet-100 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-colors"
                    />
                    <span className="text-xs text-lilac-500">seconds</span>
                  </div>
                </div>
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="p-1.5 rounded-lg text-lilac-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-2"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addStep}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-forest bg-forest-50 hover:bg-forest-100 dark:bg-forest-950/30 dark:hover:bg-forest-950/50 transition-colors active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Step
          </button>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button fullWidth disabled={!isValid} onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Create Activity'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
