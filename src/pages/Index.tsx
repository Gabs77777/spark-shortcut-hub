import { useState, useMemo, useEffect } from "react";
import { 
  Flame, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ImportDialog } from "@/components/ImportDialog";
import AddSnippetDialog from "@/components/AddSnippetDialog";
import AddFolderDialog from "@/components/AddFolderDialog";
import { Label } from "@/components/ui/label";
import { Snippet as TauriSnippet, Folder, listSnippets, listFolders, createSnippet, deleteSnippet, createFolder } from "@/lib/tauri";
import { toast } from "@/hooks/use-toast";

interface DisplayCategory {
  name: string;
  icon?: string;
  expanded: boolean;
  snippets: TauriSnippet[];
}

const Index = () => {
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [snippets, setSnippets] = useState<TauriSnippet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [testText, setTestText] = useState("");

  // Simple text expansion for demo purposes
  const handleTestTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const lastWord = newValue.split(/\s/).pop() || "";
    
    // Check if the last word matches any snippet shortcut
    const matchingSnippet = snippets.find(snippet => 
      lastWord.endsWith(snippet.shortcut)
    );
    
    if (matchingSnippet && lastWord === matchingSnippet.shortcut) {
      // Replace the shortcut with the snippet body
      const withoutShortcut = newValue.slice(0, -matchingSnippet.shortcut.length);
      setTestText(withoutShortcut + matchingSnippet.body);
    } else {
      setTestText(newValue);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [foldersData, snippetsData] = await Promise.all([
        listFolders(1), // Use default user ID of 1
        listSnippets(1), // Use default user ID of 1
      ]);
      
      setFolders(foldersData);
      setSnippets(snippetsData);
      
      // Group snippets by folder
      const categorizedSnippets = foldersData.map(folder => ({
        name: folder.name,
        expanded: true,
        snippets: snippetsData.filter(snippet => snippet.folder_id === folder.id),
      }));
      
      // Add uncategorized snippets
      const uncategorizedSnippets = snippetsData.filter(snippet => !snippet.folder_id);
      if (uncategorizedSnippets.length > 0) {
        categorizedSnippets.unshift({
          name: "Uncategorized",
          expanded: true,
          snippets: uncategorizedSnippets,
        });
      }
      
      setCategories(categorizedSnippets);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    }
  };

  const toggleCategory = (categoryName: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.name === categoryName ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  const handleDeleteSnippet = async (snippetId: number) => {
    try {
      await deleteSnippet(snippetId);
      loadData();
      toast({
        title: "Success",
        description: "Snippet deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete snippet",
        variant: "destructive",
      });
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    return categories.map(category => ({
      ...category,
      snippets: category.snippets.filter(snippet =>
        snippet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.shortcut.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.snippets.length > 0);
  }, [categories, searchTerm]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-md">
                <Flame className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-semibold">Spark Shortcut Hub</h1>
            </div>
            <div className="flex items-center gap-2">
              <ImportDialog userId={1} onImportComplete={loadData} />
              <SettingsDialog />
            </div>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          
          <div className="space-y-2">
            <AddSnippetDialog userId={1} folders={folders} onSuccess={loadData} />
            <AddFolderDialog userId={1} onSuccess={loadData} />
          </div>
        </div>

        <div className="p-2 overflow-y-auto max-h-[calc(100vh-200px)]">
          {filteredCategories.map((category) => (
            <div key={category.name} className="mb-2">
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center gap-2 p-2 text-left hover:bg-accent rounded-md text-sm font-medium"
              >
                {category.expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                📁 {category.name}
              </button>
              
              {category.expanded && (
                <div className="ml-6 space-y-1">
                  {category.snippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-card-foreground truncate block">
                          {snippet.name}
                        </span>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {snippet.shortcut}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSnippet(snippet.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Welcome to Spark Shortcut Hub</h1>
          
          <div className="mb-8">
            <p className="text-lg text-muted-foreground mb-4">
              You can try out your snippets below. Your shortcuts will work system-wide in any application.
              Try typing shortcuts like{" "}
              <Badge variant="secondary" className="mx-1">/green</Badge>{" "}
              or{" "}
              <Badge variant="secondary" className="mx-1">/json</Badge>{" "}
              in the test area below.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <Label htmlFor="test-area" className="text-sm font-medium mb-2 block">
              Test your snippets here
            </Label>
            <Textarea
              id="test-area"
              value={testText}
              onChange={handleTestTextChange}
              className="min-h-[120px]"
              placeholder="Type your snippets here to test them. Your shortcuts will also work in any other application on your computer!"
            />
          </div>

          <div className="mb-6">
            <p className="text-muted-foreground mb-4">
              🔥 Your shortcuts work system-wide in Gmail, Slack, VS Code, and any other application. 
              The expansion engine runs in the background and will automatically replace your shortcuts as you type.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-lg font-medium">Create a new snippet now</p>
            <AddSnippetDialog userId={1} folders={folders} onSuccess={loadData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;