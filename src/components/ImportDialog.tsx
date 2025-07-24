import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileText } from "lucide-react";
import { importTextBlaze } from "@/lib/tauri";
import { toast } from "@/hooks/use-toast";

interface ImportDialogProps {
  userId: number;
  onImportComplete: () => void;
}

export function ImportDialog({ userId, onImportComplete }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [jsonData, setJsonData] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonData(content);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!jsonData.trim()) {
      toast({
        title: "Error",
        description: "Please paste JSON data or upload a file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await importTextBlaze(userId, jsonData);
      onImportComplete();
      setOpen(false);
      setJsonData("");
      
      toast({
        title: "Success",
        description: "Snippets imported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import snippets: " + (error as string),
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Import Text Blaze Snippets</DialogTitle>
          <DialogDescription>
            Import your existing snippets from Text Blaze by uploading a JSON file or pasting the data directly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload JSON file</Label>
            <div className="flex items-center space-x-2">
              <input
                id="file-upload"
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="json-data">Or paste JSON data</Label>
            <Textarea
              id="json-data"
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder="Paste your Text Blaze export JSON data here..."
              className="min-h-[200px]"
            />
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="text-sm font-medium mb-2">Supported formats:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Text Blaze JSON export</li>
              <li>• CSV files with name, shortcut, content columns</li>
              <li>• Custom JSON with name, shortcut, text/content fields</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={loading || !jsonData.trim()}>
            {loading ? "Importing..." : "Import Snippets"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}