"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { Upload, Plus, Trash2, Download, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useCustomTheme,
  ThemeColors,
  CustomTheme,
  DEFAULT_THEME_COLORS,
} from "@/hooks/useCustomTheme";
import { hexToHsl, hslToHex } from "@/lib/colors";
import { toast } from "react-hot-toast";

export function ThemeManager() {
  const { theme } = useTheme();
  const {
    customThemes,
    presets,
    saveTheme,
    deleteTheme,
    applyTheme,
    mounted,
  } = useCustomTheme();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newThemeName, setNewThemeName] = React.useState("");
  const [newThemeColors, setNewThemeColors] =
    React.useState<ThemeColors>(DEFAULT_THEME_COLORS);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!mounted) return null;

  const handleColorChange = (key: keyof ThemeColors, hex: string) => {
    setNewThemeColors((prev) => ({
      ...prev,
      [key]: hexToHsl(hex),
    }));
  };

  const handleCreateTheme = () => {
    if (!newThemeName.trim()) {
      toast.error("Please enter a theme name");
      return;
    }
    const id = `custom-${Date.now()}`;
    const newTheme: CustomTheme = {
      id,
      name: newThemeName,
      colors: newThemeColors,
    };
    saveTheme(newTheme);
    applyTheme(id);
    setIsCreateOpen(false);
    setNewThemeName("");
    setNewThemeColors(DEFAULT_THEME_COLORS);
    toast.success("Theme created successfully");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.name || !json.colors) {
          throw new Error("Invalid theme format");
        }
        const id = `custom-${Date.now()}`;
        const importedTheme: CustomTheme = {
          ...json,
          id,
        };
        saveTheme(importedTheme);
        applyTheme(id);
        toast.success("Theme imported successfully");
      } catch {
        toast.error("Failed to import theme");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExportTheme = (themeId: string) => {
    const themeToExport =
      customThemes.find((t) => t.id === themeId) ||
      presets.find((t) => t.id === themeId);
    if (!themeToExport) return;

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            name: themeToExport.name,
            colors: themeToExport.colors,
          },
          null,
          2
        )
      );
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${themeToExport.name}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Palette className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-xl font-mono uppercase tracking-[0.15em]">Theme</h2>
      </div>

      <div className="rounded-2xl bg-card/50 backdrop-blur-sm border border-border/40 p-6 space-y-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Current Theme</label>
            <span className="text-xs text-muted-foreground">
              Select a theme or create your own
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={theme} onValueChange={(val) => applyTheme(val)}>
              <SelectTrigger className="w-[180px] bg-background/50 border-border/50">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Default</SelectLabel>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectGroup>

                {presets.length > 0 && (
                  <>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Presets</SelectLabel>
                      {presets.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </>
                )}

                {customThemes.length > 0 && (
                  <>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>My Themes</SelectLabel>
                      {customThemes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </>
                )}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="border-border/50"
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleImportClick}
              className="border-border/50"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Custom Themes List */}
        {customThemes.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-medium">My Themes</label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {customThemes.map((t, index) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                  className="group flex items-center justify-between rounded-xl border border-border/40 bg-background/50 p-3 hover:border-primary/30 transition-colors"
                >
                  <span className="font-medium text-sm truncate">{t.name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleExportTheme(t.id)}
                      title="Export Theme"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteTheme(t.id)}
                      title="Delete Theme"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Theme Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Theme</DialogTitle>
            <DialogDescription>
              Customize your theme colors. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="name"
                className="text-right text-sm font-medium"
              >
                Name
              </label>
              <Input
                id="name"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                className="col-span-3"
                placeholder="My Cool Theme"
              />
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Colors</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Object.keys(DEFAULT_THEME_COLORS).map((key) => {
                  const colorKey = key as keyof ThemeColors;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-xl border border-border/40 bg-background/50 p-3"
                    >
                      <label
                        htmlFor={key}
                        className="text-sm font-medium capitalize"
                      >
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id={key}
                          value={hslToHex(newThemeColors[colorKey])}
                          onChange={(e) =>
                            handleColorChange(colorKey, e.target.value)
                          }
                          className="h-8 w-8 cursor-pointer rounded border-0 p-0"
                        />
                        <span className="text-xs text-muted-foreground w-16 font-mono">
                          {hslToHex(newThemeColors[colorKey])}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTheme}>Save Theme</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}
