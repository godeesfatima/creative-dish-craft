import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ChefHat, UtensilsCrossed, Clock, MapPin } from "lucide-react";

const Index = () => {
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .limit(3);
      if (data) setFeaturedItems(data);
    };
    fetchFeaturedItems();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Saveurs Authentiques
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-8 drop-shadow-md">
            Découvrez l'art culinaire marocain traditionnel
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-warm-glow">
                <UtensilsCrossed className="mr-2 h-5 w-5" />
                Voir le Menu
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20">
                Espace Admin
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Pourquoi Nous Choisir</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-card-hover transition-shadow">
              <ChefHat className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">Cuisine Authentique</h3>
              <p className="text-muted-foreground">
                Des recettes traditionnelles transmises de génération en génération
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-card-hover transition-shadow">
              <Clock className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">Service Rapide</h3>
              <p className="text-muted-foreground">
                Préparation soignée et service efficace pour votre satisfaction
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-card-hover transition-shadow">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-3">Ambiance Chaleureuse</h3>
              <p className="text-muted-foreground">
                Un cadre accueillant qui vous fait voyager au Maroc
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Menu Items */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Nos Spécialités</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-card-hover transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <UtensilsCrossed className="h-16 w-16 text-primary/50" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <p className="text-2xl font-bold text-primary">{item.price} DH</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/menu">
              <Button size="lg">Voir Tout le Menu</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
