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
import { Plus } from "lucide-react";

interface Snippet {
  id: string;
  name: string;
  content: string;
  tags?: string[];
}

interface AddSnippetDialogProps {
  onAdd: (snippet: Omit<Snippet, 'id'>) => void;
}

export default function AddSnippetDialog({ onAdd }: AddSnippetDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    onAdd({
      name: name.trim(),
      content: content.trim(),
    });

    setName("");
    setContent("");
    setIsOpen(false);
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
            Add a new code snippet to your collection. Give it a descriptive name and paste your code.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Snippet name (e.g., 'React useState hook')"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Textarea
              placeholder="Enter your code snippet here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] font-mono bg-secondary border-border"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || !content.trim()}
              className="bg-gradient-primary hover:shadow-glow"
            >
              Create Snippet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};