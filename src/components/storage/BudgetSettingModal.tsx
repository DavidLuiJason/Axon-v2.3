import React, { useState, useEffect } from 'react';
import { X, HardDrive, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatBytes } from '../../lib/storageManifest';
import { ModalOverlayContainer } from '../ModalOverlayContainer';

interface BudgetSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BUDGET_PRESETS = [
  { label: '5 GB (Minimal)', bytes: 5 * 1024 * 1024 * 1024 },
  { label: '10 GB (Compact)', bytes: 10 * 1024 * 1024 * 1024 },
  { label: '15 GB (Recommended)', bytes: 15 * 1024 * 1024 * 1024 },
  { label: '25 GB (Power User)', bytes: 25 * 1024 * 1024 * 1024 },
];

export const BudgetSettingModal: React.FC<BudgetSettingModalProps> = ({ isOpen, onClose }) => {
  const { storageBudget, storageBreakdown, setStorageBudgetBytes, updateStorageBudget } = useApp();
  const [threshold, setThreshold] = useState(storageBudget.warningThresholdPercent || 85);
  const [customGb, setCustomGb] = useState('');

  // Keep threshold and custom input synchronized with active state when opened
  useEffect(() => {
    if (isOpen) {
      setThreshold(storageBudget.warningThresholdPercent || 85);
      const isPreset = BUDGET_PRESETS.some((p) => p.bytes === storageBudget.budgetBytes);
      if (!isPreset && storageBudget.budgetBytes > 0) {
        const gb = (storageBudget.budgetBytes / (1024 * 1024 * 1024)).toFixed(1).replace(/\.0$/, '');
        setCustomGb(gb);
      } else if (storageBudget.customLimitBytes && !isPreset) {
        const gb = (storageBudget.customLimitBytes / (1024 * 1024 * 1024)).toFixed(1).replace(/\.0$/, '');
        setCustomGb(gb);
      } else {
        setCustomGb('');
      }
    }
  }, [isOpen, storageBudget.budgetBytes, storageBudget.customLimitBytes, storageBudget.warningThresholdPercent]);

  if (!isOpen) return null;

  const currentUsagePercent =
    storageBudget.budgetBytes > 0
      ? Math.min(100, (storageBreakdown.totalStoredBytes / storageBudget.budgetBytes) * 100)
      : 0;

  const handleApplyCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseFloat(customGb);
    if (!isNaN(val) && val > 0) {
      const bytes = Math.round(val * 1024 * 1024 * 1024);
      setStorageBudgetBytes(bytes);
    }
  };

  const handleClose = () => {
    // If user entered a custom value but didn't explicitly hit Apply, save it before closing
    const val = parseFloat(customGb);
    if (!isNaN(val) && val > 0) {
      const targetBytes = Math.round(val * 1024 * 1024 * 1024);
      if (targetBytes !== storageBudget.budgetBytes) {
        setStorageBudgetBytes(targetBytes);
      }
    }
    onClose();
  };

  const isCustomActive = !BUDGET_PRESETS.some((p) => p.bytes === storageBudget.budgetBytes);

  return (
    <ModalOverlayContainer
      isOpen={isOpen}
      onClose={handleClose}
      id="budget-setting-modal"
      maxWidth="md"
      ariaLabel="Storage Budget Configuration"
      className="p-5 space-y-4"
    >
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-neutral-300" />
          <h2 className="text-sm font-bold">Storage Budget Configuration</h2>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Current Real-time Storage State */}
      <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-neutral-400">Current Storage Used</span>
          <span className="font-semibold text-white font-mono">
            {formatBytes(storageBreakdown.totalStoredBytes)} / {formatBytes(storageBudget.budgetBytes, 0)} ({Math.round(currentUsagePercent)}%)
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              currentUsagePercent >= (storageBudget.warningThresholdPercent || 85)
                ? 'bg-rose-500'
                : currentUsagePercent >= 60
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${currentUsagePercent}%` }}
          />
        </div>
        <p className="text-[11px] text-neutral-500">
          Remaining space in budget: {formatBytes(Math.max(0, storageBudget.budgetBytes - storageBreakdown.totalStoredBytes))}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-300">Device Quota Presets</label>
          {isCustomActive && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Custom Active: {formatBytes(storageBudget.budgetBytes, 0)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {BUDGET_PRESETS.map((preset) => {
            const isActive = storageBudget.budgetBytes === preset.bytes;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setStorageBudgetBytes(preset.bytes);
                  setCustomGb('');
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  isActive
                    ? 'bg-white text-black border-white'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Quota Input */}
      <form onSubmit={handleApplyCustom} className="space-y-1.5">
        <label className="text-xs font-semibold text-neutral-300">Custom Storage Limit</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="2048"
              placeholder="e.g. 20"
              value={customGb}
              onChange={(e) => setCustomGb(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-750 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-mono">
              GB
            </span>
          </div>
          <button
            type="submit"
            disabled={!customGb || isNaN(parseFloat(customGb))}
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-semibold text-xs border border-neutral-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </form>

      <div className="space-y-2 pt-2 border-t border-neutral-800">
        <div className="flex justify-between text-xs">
          <span className="text-neutral-400">Warning Threshold</span>
          <span className="font-semibold text-white">{threshold}%</span>
        </div>
        <input
          type="range"
          min={50}
          max={95}
          step={5}
          value={threshold}
          onChange={(e) => {
            const val = Number(e.target.value);
            setThreshold(val);
            updateStorageBudget({ warningThresholdPercent: val });
          }}
          className="w-full accent-white"
        />
        <p className="text-[11px] text-neutral-500">
          AXON will alert you when stored assets exceed {threshold}% of the budget.
        </p>
      </div>

      <div className="pt-2 flex justify-end shrink-0">
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
        >
          Done
        </button>
      </div>
    </ModalOverlayContainer>
  );
};
