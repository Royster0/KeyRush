"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Star,
  Lock,
  Check,
  Pencil,
  Save,
  Paintbrush,
  Frame,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  updateBannerPreset,
  setActiveBannerPreset,
  renameBannerPreset,
} from "@/app/actions";
import {
  BACKGROUNDS,
  BORDERS,
  TITLES,
  COMPONENT_MAP,
  isValidPresetName,
  PRESET_NAME_MAX_LENGTH,
} from "@/lib/banners";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import { RankIcon } from "@/components/RankIcon";
import type { BannerPreset, PresetSlot, BannerComponentType, BannerComponentDefinition } from "@/types/banner.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BannerClientProps {
  presets: BannerPreset[];
  activeSlot: PresetSlot;
  unlockedIds: string[];
  username: string;
  rankTier: string | null;
  level: number;
}

// ---------------------------------------------------------------------------
// Visual style maps
// ---------------------------------------------------------------------------

const BG_STYLES: Record<string, React.CSSProperties> = {
  bg_starter_fade: {
    background: "linear-gradient(135deg, #18181b 0%, #27272a 50%, #1c1c1f 100%)",
  },
  bg_arcade_grid: {
    background:
      "linear-gradient(135deg, #0c0a1a 0%, #1a1a2e 100%)",
    backgroundImage:
      "linear-gradient(135deg, #0c0a1a 0%, #1a1a2e 100%), repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(99, 102, 241, 0.08) 24px, rgba(99, 102, 241, 0.08) 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(99, 102, 241, 0.08) 24px, rgba(99, 102, 241, 0.08) 25px)",
  },
  bg_neon_drift: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #0e7490 70%, #06b6d4 100%)",
  },
  bg_velocity_lines: {
    background:
      "repeating-linear-gradient(135deg, #18181b 0px, #18181b 8px, #27272a 8px, #27272a 9px, #18181b 9px, #18181b 20px), linear-gradient(135deg, #18181b 0%, #1f1f23 100%)",
  },
  bg_precision_wave: {
    background:
      "linear-gradient(135deg, #042f2e 0%, #0d3d38 25%, #0f766e 50%, #14b8a6 75%, #0d9488 100%)",
  },
  bg_grindstone: {
    background:
      "linear-gradient(160deg, #1c1917 0%, #292524 30%, #1c1917 60%, #292524 100%)",
  },
  bg_elite_pulse: {
    background:
      "radial-gradient(ellipse at 30% 50%, #854d0e 0%, #422006 40%, #1c1917 70%)",
  },
  bg_champion_aura: {
    background:
      "linear-gradient(135deg, #422006 0%, #a16207 30%, #facc15 50%, #a16207 70%, #422006 100%)",
  },
  bg_mach_burst: {
    background:
      "radial-gradient(ellipse at 50% 50%, #991b1b 0%, #7f1d1d 30%, #450a0a 60%, #1c1917 90%)",
  },
};

const BORDER_STYLES: Record<string, string> = {
  border_clean: "border border-zinc-700/50",
  border_victor: "border-2 border-amber-500/60",
  border_unstoppable: "border-2 border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.3)]",
  border_bronze: "border-2 border-amber-700/70",
  border_silver: "border-2 border-zinc-400/70",
  border_gold: "border-2 border-yellow-500/70",
  border_platinum: "border-2 border-cyan-400/70",
  border_diamond: "border-2 border-blue-400/70",
  border_sonic: "border-2 border-emerald-400/70",
  border_mach: "border-2 border-red-500/70",
  border_tachyon: "border-2 border-fuchsia-400/70 shadow-[0_0_16px_rgba(232,121,249,0.25)]",
};

const COMPONENT_TYPE_TABS: { type: BannerComponentType; label: string; icon: typeof Paintbrush }[] = [
  { type: "background", label: "Backgrounds", icon: Paintbrush },
  { type: "border", label: "Borders", icon: Frame },
  { type: "title", label: "Titles", icon: Type },
];

function getUnlockLabel(def: BannerComponentDefinition): string {
  const { unlock } = def;
  if (unlock.type === "default") return "Default";
  if (unlock.type === "peak_rank") return `Reach ${unlock.rank} rank`;
  // Badge-based: look up the badge name
  const badge = BADGE_DEFINITIONS[unlock.badgeId];
  return badge ? `Earn "${badge.name}" badge` : `Earn badge`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BannerClient({ presets, activeSlot, unlockedIds, username, rankTier, level }: BannerClientProps) {
  const unlockedSet = useMemo(() => new Set(unlockedIds), [unlockedIds]);

  // Local state
  const [selectedSlot, setSelectedSlot] = useState<PresetSlot>(activeSlot);
  const [localPresets, setLocalPresets] = useState<BannerPreset[]>(presets);
  const [localActiveSlot, setLocalActiveSlot] = useState<PresetSlot>(activeSlot);
  const [pickerTab, setPickerTab] = useState<BannerComponentType>("background");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Derived
  const currentPreset = localPresets.find((p) => p.slot === selectedSlot) ?? {
    id: "",
    userId: "",
    slot: selectedSlot,
    name: `Preset ${selectedSlot}`,
    backgroundId: "bg_starter_fade",
    borderId: "border_clean",
    titleId: "title_rookie",
  };
  const hasUnsavedChanges = useMemo(() => {
    const original = presets.find((p) => p.slot === selectedSlot);
    if (!original) return false;
    return (
      original.backgroundId !== currentPreset.backgroundId ||
      original.borderId !== currentPreset.borderId ||
      original.titleId !== currentPreset.titleId
    );
  }, [presets, selectedSlot, currentPreset]);

  const bgStyle = BG_STYLES[currentPreset.backgroundId] ?? BG_STYLES.bg_starter_fade;
  const borderClass = BORDER_STYLES[currentPreset.borderId] ?? BORDER_STYLES.border_clean;
  const titleDef = COMPONENT_MAP[currentPreset.titleId];

  // Helpers
  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const getComponentsForTab = useCallback(() => {
    switch (pickerTab) {
      case "background": return BACKGROUNDS;
      case "border": return BORDERS;
      case "title": return TITLES;
    }
  }, [pickerTab]);

  const getSelectedIdForTab = useCallback(() => {
    switch (pickerTab) {
      case "background": return currentPreset.backgroundId;
      case "border": return currentPreset.borderId;
      case "title": return currentPreset.titleId;
    }
  }, [pickerTab, currentPreset]);

  // Actions
  const handleSelectComponent = useCallback(
    (componentId: string, type: BannerComponentType) => {
      if (!unlockedSet.has(componentId)) return;
      setLocalPresets((prev) =>
        prev.map((p) => {
          if (p.slot !== selectedSlot) return p;
          switch (type) {
            case "background": return { ...p, backgroundId: componentId };
            case "border": return { ...p, borderId: componentId };
            case "title": return { ...p, titleId: componentId };
          }
        })
      );
    },
    [selectedSlot, unlockedSet]
  );

  const handleSave = useCallback(() => {
    startTransition(async () => {
      const result = await updateBannerPreset(
        selectedSlot,
        currentPreset.backgroundId,
        currentPreset.borderId,
        currentPreset.titleId
      );
      if (result.ok) {
        showToast("Preset saved", "success");
      } else {
        showToast(result.error, "error");
      }
    });
  }, [selectedSlot, currentPreset, showToast]);

  const handleSetActive = useCallback(
    (slot: PresetSlot) => {
      startTransition(async () => {
        const result = await setActiveBannerPreset(slot);
        if (result.ok) {
          setLocalActiveSlot(slot);
          showToast("Active preset updated", "success");
        } else {
          showToast(result.error, "error");
        }
      });
    },
    [showToast]
  );

  const handleStartRename = useCallback(() => {
    setNameValue(currentPreset.name);
    setEditingName(true);
  }, [currentPreset.name]);

  const handleFinishRename = useCallback(() => {
    setEditingName(false);
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === currentPreset.name) return;
    if (!isValidPresetName(trimmed)) {
      showToast("Invalid name", "error");
      return;
    }
    setLocalPresets((prev) =>
      prev.map((p) => (p.slot === selectedSlot ? { ...p, name: trimmed } : p))
    );
    startTransition(async () => {
      const result = await renameBannerPreset(selectedSlot, trimmed);
      if (!result.ok) {
        showToast(result.error, "error");
        // Revert
        setLocalPresets((prev) =>
          prev.map((p) => (p.slot === selectedSlot ? { ...p, name: currentPreset.name } : p))
        );
      }
    });
  }, [nameValue, selectedSlot, currentPreset.name, showToast]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-12 space-y-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Banner</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Customize your banner with backgrounds, borders, and titles.
          </p>
        </motion.header>

        {/* Preset Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="inline-flex gap-2 p-1.5 rounded-2xl bg-muted/30">
            {localPresets.map((preset) => {
              const isSelected = preset.slot === selectedSlot;
              const isActive = preset.slot === localActiveSlot;
              return (
                <button
                  key={preset.slot}
                  onClick={() => setSelectedSlot(preset.slot)}
                  className={cn(
                    "relative px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2",
                    isSelected ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="presetTab"
                      className="absolute inset-0 bg-background rounded-xl shadow-sm"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isActive && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />}
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Preset Name + Actions Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {/* Editable name */}
          <div className="flex items-center gap-2">
            {editingName ? (
              <input
                autoFocus
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleFinishRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleFinishRename();
                  if (e.key === "Escape") setEditingName(false);
                }}
                maxLength={PRESET_NAME_MAX_LENGTH}
                className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 w-48"
              />
            ) : (
              <button
                onClick={handleStartRename}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/30"
              >
                <Pencil className="h-3.5 w-3.5" />
                Rename
              </button>
            )}
          </div>

          {/* Set Active */}
          {selectedSlot !== localActiveSlot && (
            <button
              onClick={() => handleSetActive(selectedSlot)}
              disabled={isPending}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
            >
              <Star className="h-3.5 w-3.5" />
              Set Active
            </button>
          )}

          {/* Save */}
          {hasUnsavedChanges && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </motion.button>
          )}
        </motion.div>

        {/* Live Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentPreset.backgroundId}-${currentPreset.borderId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn("relative rounded-2xl overflow-hidden", borderClass)}
              style={bgStyle}
            >
              <div className="relative z-10 flex items-center py-8 px-6 gap-5">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/15 flex items-center justify-center">
                    <span className="text-4xl font-black text-white drop-shadow-sm">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {level > 0 && (
                    <div className="absolute -bottom-1.5 -right-1.5 w-9 h-9 rounded-lg bg-black/70 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                      {level}
                    </div>
                  )}
                </div>
                {/* Text */}
                <div className="flex flex-col min-w-0">
                  <span className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-lg truncate">
                    {username}
                  </span>
                  <motion.span
                    key={currentPreset.titleId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs font-semibold uppercase tracking-widest text-white/45"
                  >
                    {titleDef?.name ?? "Rookie"}
                  </motion.span>
                  {rankTier && rankTier !== "Unranked" && rankTier !== "Placement" && (
                    <span className="flex items-center gap-1 mt-0.5 text-sm font-medium text-white/40">
                      <RankIcon rank={rankTier} size={16} />
                      {rankTier}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Component Picker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="space-y-6"
        >
          {/* Picker Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex gap-1 p-1 rounded-xl bg-muted/30">
              {COMPONENT_TYPE_TABS.map(({ type, label, icon: Icon }) => {
                const isActive = pickerTab === type;
                return (
                  <button
                    key={type}
                    onClick={() => setPickerTab(type)}
                    className={cn(
                      "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="pickerTab"
                        className="absolute inset-0 bg-background rounded-lg shadow-sm"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Picker Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={pickerTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            >
              {getComponentsForTab().map((def, index) => {
                const isUnlocked = unlockedSet.has(def.id);
                const isSelected = getSelectedIdForTab() === def.id;

                return (
                  <motion.button
                    key={def.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    disabled={!isUnlocked}
                    onClick={() => handleSelectComponent(def.id, pickerTab)}
                    className={cn(
                      "relative group rounded-xl p-3 text-left transition-all",
                      isUnlocked
                        ? isSelected
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-muted/20 hover:bg-muted/40 ring-1 ring-border/40 hover:ring-border"
                        : "bg-muted/10 ring-1 ring-border/20 opacity-50 cursor-not-allowed"
                    )}
                  >
                    {/* Thumbnail */}
                    <div
                      className={cn(
                        "h-16 rounded-lg mb-2 overflow-hidden",
                        pickerTab === "border"
                          ? BORDER_STYLES[def.id] ?? "border border-zinc-700/50"
                          : "border border-transparent"
                      )}
                      style={
                        pickerTab === "background"
                          ? BG_STYLES[def.id] ?? BG_STYLES.bg_starter_fade
                          : pickerTab === "title"
                            ? { background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)" }
                            : { background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)" }
                      }
                    >
                      {pickerTab === "title" && (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white/80 tracking-wide">
                            {def.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Label row */}
                    <div className="flex items-center gap-1.5">
                      {isSelected && isUnlocked && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                      {!isUnlocked && (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-xs font-medium truncate">{def.name}</span>
                    </div>

                    {/* Unlock requirement */}
                    {!isUnlocked && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {getUnlockLabel(def)}
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm",
              toast.type === "success"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-red-500/20 text-red-300 border border-red-500/30"
            )}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
