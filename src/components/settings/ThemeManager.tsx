"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Upload, Plus, Trash2, Download } from "lucide-react";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCustomTheme, ThemeColors, CustomTheme, DEFAULT_THEME_COLORS } from "@/hooks/useCustomTheme";
import { hexToHsl, hslToHex } from "@/lib/colors";
import { toast } from "react-hot-toast";

export function ThemeManager() {
    const { theme, setTheme } = useTheme();
    const { customThemes, presets, saveTheme, deleteTheme, applyTheme, mounted } = useCustomTheme();
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [newThemeName, setNewThemeName] = React.useState("");
    const [newThemeColors, setNewThemeColors] = React.useState<ThemeColors>(DEFAULT_THEME_COLORS);
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
                // Basic validation
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
        // Reset input
        e.target.value = "";
    };

    const handleExportTheme = (themeId: string) => {
        const themeToExport = customThemes.find((t) => t.id === themeId) || presets.find((t) => t.id === themeId);
        if (!themeToExport) return;

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
            name: themeToExport.name,
            colors: themeToExport.colors
        }, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${themeToExport.name}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <p className="text-sm text-muted-foreground">
                    Select a theme or create your own.
                </p>
                <div className="flex items-center gap-4">
                    <Select value={theme} onValueChange={(val) => applyTheme(val)}>
                        <SelectTrigger className="w-[200px]">
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

                    <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Theme
                    </Button>

                    <Button variant="outline" onClick={handleImportClick}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Theme
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

            {/* List of Custom Themes with Actions */}
            {customThemes.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-sm font-medium">My Themes</h4>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {customThemes.map((t) => (
                            <div
                                key={t.id}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <span className="font-medium">{t.name}</span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleExportTheme(t.id)}
                                        title="Export Theme"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteTheme(t.id)}
                                        className="text-destructive hover:text-destructive"
                                        title="Delete Theme"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create New Theme</DialogTitle>
                        <DialogDescription>
                            Customize your theme colors. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right text-sm font-medium">
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
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {Object.keys(DEFAULT_THEME_COLORS).map((key) => {
                                    const colorKey = key as keyof ThemeColors;
                                    return (
                                        <div
                                            key={key}
                                            className="flex items-center justify-between rounded-md border p-2"
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
        </div>
    );
}
