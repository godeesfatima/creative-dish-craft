import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { ChefHat, Home } from "lucide-react";

const emailSchema = z.string().email("Email invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/admin");
      }
    };
    checkUser();
  }, [navigate]);

  const validateForm = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes("Invalid")) {
            toast.error("Email ou mot de passe incorrect");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Connexion réussie!");
          navigate("/admin");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Cet email est déjà enregistré");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Compte créé! Vous pouvez maintenant vous connecter.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background px-4 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        <Link to="/">
          <Button variant="ghost" className="mb-6 hover-scale">
            <Home className="mr-2 h-4 w-4" />
            Retour au Site
          </Button>
        </Link>

        <Card className="p-10 shadow-card-hover animate-fade-in bg-card/80 backdrop-blur-sm">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-primary/10 rounded-full mb-6">
              <ChefHat className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-3">
              {isLogin ? "Connexion Admin" : "Créer un Compte"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isLogin
                ? "Connectez-vous pour gérer le menu"
                : "Créez un compte administrateur"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@restaurant.ma"
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                className="h-12 text-base"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base hover-scale" 
              disabled={loading}
            >
              {loading ? "Chargement..." : isLogin ? "Se connecter" : "Créer le compte"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium text-base"
            >
              {isLogin
                ? "Pas de compte? Créer un compte"
                : "Déjà un compte? Se connecter"}
            </button>
          </div>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-in animation-delay-200">
          <p>💡 Après l'inscription, contactez l'administrateur principal pour obtenir les droits admin</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
