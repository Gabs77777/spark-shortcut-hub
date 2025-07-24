import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, SettingsIcon } from "lucide-react";
import { getSettings, updateSettings, Settings as SettingsType } from "@/lib/tauri";
import { toast } from "@/hooks/use-toast";

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsType>({
    expand_enabled: true,
    global_hotkey: "Ctrl+Alt+Space",
    excluded_apps: [],
  });
  const [loading, setLoading] = useState(false);
  const [excludedAppsText, setExcludedAppsText] = useState("");

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    try {
      const currentSettings = await getSettings();
      setSettings(currentSettings);
      setExcludedAppsText(currentSettings.excluded_apps.join('\n'));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedSettings = {
        ...settings,
        excluded_apps: excludedAppsText
          .split('\n')
          .map(app => app.trim())
          .filter(app => app.length > 0),
      };
      
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      setOpen(false);
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your snippet expansion preferences and global hotkeys.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable snippet expansion</Label>
              <p className="text-sm text-muted-foreground">
                Turn on/off automatic snippet expansion while typing
              </p>
            </div>
            <Switch
              checked={settings.expand_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, expand_enabled: checked })
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hotkey">Global hotkey</Label>
            <Input
              id="hotkey"
              value={settings.global_hotkey}
              onChange={(e) =>
                setSettings({ ...settings, global_hotkey: e.target.value })
              }
              placeholder="Ctrl+Alt+Space"
            />
            <p className="text-sm text-muted-foreground">
              Hotkey to open the snippet search palette
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="excluded-apps">Excluded applications</Label>
            <Textarea
              id="excluded-apps"
              value={excludedAppsText}
              onChange={(e) => setExcludedAppsText(e.target.value)}
              placeholder="Enter app names, one per line&#10;e.g., 1Password&#10;Terminal&#10;Keychain Access"
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground">
              Snippets won't expand in these applications
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}