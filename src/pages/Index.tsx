import { useState, useMemo } from "react";
import { 
  Flame, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Search,
  HelpCircle,
  MessageCircle,
  Mail,
  Book,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Snippet {
  id: string;
  name: string;
  shortcut: string;
  category: string;
}

interface Category {
  name: string;
  icon?: string;
  expanded: boolean;
  snippets: Snippet[];
}

// Sample data matching Text Blaze structure
const initialCategories: Category[] = [
  {
    name: "Botavive",
    expanded: true,
    snippets: [
      { id: "1", name: "Green Color", shortcut: "/green", category: "Botavive" },
      { id: "2", name: "JSON", shortcut: "/json", category: "Botavive" },
      { id: "3", name: "Harmony", shortcut: "/harmony", category: "Botavive" },
      { id: "4", name: "Balance", shortcut: "/balance", category: "Botavive" },
      { id: "5", name: "Dream", shortcut: "/dream", category: "Botavive" },
      { id: "6", name: "Free Blueprint", shortcut: "/free", category: "Botavive" },
      { id: "7", name: "ASIN Dream", shortcut: "/adream", category: "Botavive" },
      { id: "8", name: "ASIN Balance", shortcut: "/abalance", category: "Botavive" },
      { id: "9", name: "ASIN Tranquility", shortcut: "/atranq", category: "Botavive" },
      { id: "10", name: "ASIN Glow", shortcut: "/aglow", category: "Botavive" },
      { id: "11", name: "ASIN Clarity", shortcut: "/aclarity", category: "Botavive" },
      { id: "12", name: "Amazon Store", shortcut: "/store", category: "Botavive" },
      { id: "13", name: "Botavive Phone Number", shortcut: "/phone", category: "Botavive" },
      { id: "14", name: "Botavie LinkedIn", shortcut: "/link", category: "Botavive" },
    ]
  },
  {
    name: "Zipify",
    expanded: true,
    snippets: [
      { id: "15", name: "Video autoplay", shortcut: "/vap", category: "Zipify" },
      { id: "16", name: "Stripe not working", shortcut: "/stripe", category: "Zipify" },
      { id: "17", name: "Exclude Express Shipping", shortcut: "/eecart", category: "Zipify" },
      { id: "18", name: "Movie camera emoji", shortcut: "/CAM", category: "Zipify" },
      { id: "19", name: "Stepping in", shortcut: "/zpst", category: "Zipify" },
      { id: "20", name: "Align menu to the left", shortcut: "/zpam", category: "Zipify" },
      { id: "21", name: "Anything else I can help you with?", shortcut: "/zpmw", category: "Zipify" },
      { id: "22", name: "Ask for a review", shortcut: "/ask", category: "Zipify" },
      { id: "23", name: "Close out", shortcut: "/zcfo", category: "Zipify" },
    ]
  }
];

const Index = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleCategory = (categoryName: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.name === categoryName ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
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
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-md">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold">Text Blaze</h1>
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
          
          <Button className="w-full bg-gradient-primary hover:shadow-glow" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New snippet
          </Button>
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
                      <span className="text-sm text-card-foreground truncate">
                        {snippet.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {snippet.shortcut}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 p-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Welcome to Text Blaze</h1>
            
            <div className="mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                You can try out your snippets below. Try typing the shortcut{" "}
                <Badge variant="secondary" className="mx-1">/send</Badge>{" "}
                or the shortcut{" "}
                <Badge variant="secondary" className="mx-1">/drop</Badge>{" "}
                below.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <textarea
                className="w-full h-40 p-4 bg-secondary border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Type your snippets here to test them..."
              />
            </div>

            <div className="mb-6">
              <p className="text-muted-foreground mb-4">
                Your shortcuts insert snippets ⚡ and will work on any website. You can also right-click on text boxes to select a snippet from the context menu.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-lg font-medium">Create a new snippet now</p>
              <Button className="bg-gradient-primary hover:shadow-glow">
                <Plus className="h-4 w-4 mr-2" />
                New snippet
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-border bg-card p-4">
          <div className="space-y-6">
            {/* Updates Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  🎉 July Text Blaze Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  Our native Mac and Windows apps have graduated from Beta! Plus, we've made other improvements.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary">
                  Learn more
                </Button>
              </CardContent>
            </Card>

            {/* Help Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Want to learn more?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 hover:bg-accent rounded-md cursor-pointer">
                  <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Text Blaze documentation</p>
                    <p className="text-xs text-muted-foreground">Guides and references</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 hover:bg-accent rounded-md cursor-pointer">
                  <Book className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Text Blaze FAQ</p>
                    <p className="text-xs text-muted-foreground">Frequently asked questions</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 hover:bg-accent rounded-md cursor-pointer">
                  <MessageCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Community forums</p>
                    <p className="text-xs text-muted-foreground">Ask questions and suggest features</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 hover:bg-accent rounded-md cursor-pointer">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Email the team</p>
                    <p className="text-xs text-muted-foreground">support@blaze.today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mascot */}
            <div className="flex justify-center pt-8">
              <div className="text-6xl">🐼</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
