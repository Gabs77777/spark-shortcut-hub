import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createUser, login, User } from "@/lib/tauri";
import { toast } from "@/hooks/use-toast";

interface LoginDialogProps {
  open: boolean;
  onLogin: (user: User) => void;
}

export function LoginDialog({ open, onLogin }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      onLogin(user);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error as string,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const user = await createUser(email, password);
      onLogin(user);
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error as string,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to Spark Shortcut Hub</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to get started.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </div>
            <Button 
              onClick={handleRegister} 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}