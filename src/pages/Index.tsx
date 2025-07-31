import { useState, useMemo, useEffect } from "react";
import { 
  Flame, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Search,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { LoginDialog } from "@/components/LoginDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ImportDialog } from "@/components/ImportDialog";
import AddSnippetDialog from "@/components/AddSnippetDialog";
import { Label } from "@/components/ui/label";
import { User, Snippet as TauriSnippet, Folder, listSnippets, listFolders, createSnippet, deleteSnippet } from "@/lib/tauri";
import { toast } from "@/hooks/use-toast";

interface DisplayCategory {
  name: string;
  icon?: string;
  expanded: boolean;
  snippets: TauriSnippet[];
}


const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [snippets, setSnippets] = useState<TauriSnippet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [testText, setTestText] = useState("");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [foldersData, snippetsData] = await Promise.all([
        listFolders(user.id),
        listSnippets(user.id),
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

  const handleLogout = () => {
    setUser(null);
    setCategories([]);
    setFolders([]);
    setSnippets([]);
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

  if (!user) {
    return <LoginDialog open={true} onLogin={setUser} />;
  }

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
              <ImportDialog userId={user.id} onImportComplete={loadData} />
              <SettingsDialog />
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
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
          
          <AddSnippetDialog onAdd={async (snippet) => {
            try {
              await createSnippet(user.id, {
                name: snippet.name,
                shortcut: snippet.name.toLowerCase().replace(/\s+/g, ''),
                body: snippet.content,
                folder_id: null,
              });
              loadData();
              toast({
                title: "Success",
                description: "Snippet created successfully",
              });
            } catch (error) {
              toast({
                title: "Error", 
                description: "Failed to create snippet",
                variant: "destructive",
              });
            }
          }} />
...
          <div className="flex items-center gap-4">
            <p className="text-lg font-medium">Create a new snippet now</p>
            <AddSnippetDialog onAdd={async (snippet) => {
              try {
                await createSnippet(user.id, {
                  name: snippet.name,
                  shortcut: snippet.name.toLowerCase().replace(/\s+/g, ''),
                  body: snippet.content,
                  folder_id: null,
                });
                loadData();
                toast({
                  title: "Success",
                  description: "Snippet created successfully",
                });
              } catch (error) {
                toast({
                  title: "Error", 
                  description: "Failed to create snippet",
                  variant: "destructive",
                });
              }
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
