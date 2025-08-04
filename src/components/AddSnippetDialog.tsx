import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { createSnippet, type Folder } from "@/lib/tauri";
import { toast } from "sonner";

interface AddSnippetDialogProps {
  userId: number;
  folders: Folder[];
  onSuccess: () => void;
}

export default function AddSnippetDialog({ userId, folders, onSuccess }: AddSnippetDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [shortcut, setShortcut] = useState("");
  const [body, setBody] = useState("");
  const [folderId, setFolderId] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortcut.trim() || !body.trim()) return;

    setIsLoading(true);
    try {
      await createSnippet(userId, {
        name: name.trim(),
        shortcut: shortcut.trim(),
        body: body.trim(),
        folder_id: folderId,
      });

      toast.success("Snippet created successfully!");
      setName("");
      setShortcut("");
      setBody("");
      setFolderId(undefined);
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to create snippet: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
          <Plus className="h-4 w-4 mr-2" />
          New Snippet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] bg-gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Create New Snippet
          </DialogTitle>
          <DialogDescription>
            Add a new text snippet with a shortcut. The shortcut will expand to your content when typed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Snippet name (e.g., 'Green Color')"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Input
              placeholder="Shortcut (e.g., '/green')"
              value={shortcut}
              onChange={(e) => setShortcut(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Select value={folderId?.toString() || "none"} onValueChange={(value) => setFolderId(value === "none" ? undefined : parseInt(value))}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Select folder (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id.toString()}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Textarea
              placeholder="Enter your snippet content here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[200px] font-mono bg-secondary border-border"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || !shortcut.trim() || !body.trim() || isLoading}
              className="bg-gradient-primary hover:shadow-glow"
            >
              {isLoading ? "Creating..." : "Create Snippet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};