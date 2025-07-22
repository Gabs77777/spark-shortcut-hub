import { useState, useMemo } from "react";
import { Flame } from "lucide-react";
import SnippetCard from "@/components/SnippetCard";
import AddSnippetDialog from "@/components/AddSnippetDialog";
import SearchBar from "@/components/SearchBar";

interface Snippet {
  id: string;
  name: string;
  content: string;
  tags?: string[];
}

// Sample snippets for demo
const initialSnippets: Snippet[] = [
  {
    id: "1",
    name: "React useState Hook",
    content: `const [state, setState] = useState(initialValue);

// Example usage
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: '', email: '' });`,
    tags: ["react", "hooks"]
  },
  {
    id: "2", 
    name: "CSS Flexbox Center",
    content: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}`,
    tags: ["css", "flexbox"]
  },
  {
    id: "3",
    name: "JavaScript Array Map",
    content: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]`,
    tags: ["javascript", "arrays"]
  }
];

const Index = () => {
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSnippets = useMemo(() => {
    if (!searchTerm) return snippets;
    return snippets.filter(snippet =>
      snippet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [snippets, searchTerm]);

  const handleAddSnippet = (newSnippet: Omit<Snippet, 'id'>) => {
    const snippet = {
      ...newSnippet,
      id: Date.now().toString(),
    };
    setSnippets(prev => [snippet, ...prev]);
  };

  const handleUpdateSnippet = (updatedSnippet: Snippet) => {
    setSnippets(prev =>
      prev.map(snippet =>
        snippet.id === updatedSnippet.id ? updatedSnippet : snippet
      )
    );
  };

  const handleDeleteSnippet = (id: string) => {
    setSnippets(prev => prev.filter(snippet => snippet.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg shadow-glow">
                <Flame className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Blaze
                </h1>
                <p className="text-sm text-muted-foreground">Code snippets made simple</p>
              </div>
            </div>
            <AddSnippetDialog onAdd={handleAddSnippet} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>

        {filteredSnippets.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
              <Flame className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No snippets found" : "No snippets yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Create your first snippet to get started"
              }
            </p>
            {!searchTerm && <AddSnippetDialog onAdd={handleAddSnippet} />}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSnippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onUpdate={handleUpdateSnippet}
                onDelete={handleDeleteSnippet}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
