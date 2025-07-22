import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Edit2, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Snippet {
  id: string;
  name: string;
  content: string;
  tags?: string[];
}

interface SnippetCardProps {
  snippet: Snippet;
  onUpdate: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
}

export default function SnippetCard({ snippet, onUpdate, onDelete }: SnippetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(snippet.name);
  const [editContent, setEditContent] = useState(snippet.content);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Snippet copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    onUpdate({
      ...snippet,
      name: editName,
      content: editContent,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(snippet.name);
    setEditContent(snippet.content);
    setIsEditing(false);
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border hover:shadow-glow transition-all duration-300 group">
      <CardHeader className="pb-3">
        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="font-semibold text-lg bg-secondary"
            placeholder="Snippet name"
          />
        ) : (
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
              {snippet.name}
            </h3>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="hover:bg-accent"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="hover:bg-accent"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(snippet.id)}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="font-mono text-sm bg-secondary min-h-[100px]"
              placeholder="Enter your snippet..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <pre className="font-mono text-sm text-muted-foreground bg-secondary p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
            {snippet.content}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}