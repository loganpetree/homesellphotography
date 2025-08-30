'use client';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function ToggleSwitch({ checked, onChange, label, className = '' }: ToggleSwitchProps) {
  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`w-10 h-6 bg-gray-200 rounded-full peer transition-colors duration-200 ${
          checked ? 'bg-[#22C55E]' : ''
        }`}>
        </div>
        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
          checked ? 'translate-x-4' : ''
        }`}>
        </div>
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>
      )}
    </label>
  );
}
