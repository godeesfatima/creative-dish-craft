import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ChefHat, UtensilsCrossed, Clock, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import tajineImage from "@/assets/tajine-poulet.jpg";
import couscousImage from "@/assets/couscous-royal.jpg";
import pastillaImage from "@/assets/pastilla.jpg";

const menuImages: Record<string, string> = {
  'Tajine Poulet': tajineImage,
  'Couscous Royal': couscousImage,
  'Pastilla au Poulet': pastillaImage,
};

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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Restaurant interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl tracking-tight">
            Saveurs Authentiques
          </h1>
          <p className="text-2xl md:text-3xl text-white/95 mb-12 drop-shadow-lg font-light">
            Découvrez l'art culinaire marocain traditionnel
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/menu">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-warm-glow text-lg px-8 py-6 hover-scale">
                <UtensilsCrossed className="mr-2 h-6 w-6" />
                Voir le Menu
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-2 border-white hover:bg-white hover:text-primary text-lg px-8 py-6 backdrop-blur-sm hover-scale transition-all duration-300">
                Espace Admin
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-secondary/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 animate-fade-in">Pourquoi Nous Choisir</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-10 text-center hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 animate-fade-in bg-card/80 backdrop-blur-sm">
              <div className="mb-6 inline-flex p-4 bg-primary/10 rounded-full">
                <ChefHat className="h-14 w-14 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Cuisine Authentique</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Des recettes traditionnelles transmises de génération en génération
              </p>
            </Card>
            <Card className="p-10 text-center hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 animate-fade-in animation-delay-200 bg-card/80 backdrop-blur-sm">
              <div className="mb-6 inline-flex p-4 bg-primary/10 rounded-full">
                <Clock className="h-14 w-14 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Service Rapide</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Préparation soignée et service efficace pour votre satisfaction
              </p>
            </Card>
            <Card className="p-10 text-center hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 animate-fade-in animation-delay-400 bg-card/80 backdrop-blur-sm">
              <div className="mb-6 inline-flex p-4 bg-primary/10 rounded-full">
                <MapPin className="h-14 w-14 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Ambiance Chaleureuse</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Un cadre accueillant qui vous fait voyager au Maroc
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Menu Items */}
      <section className="py-24 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 animate-fade-in">Nos Spécialités</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {featuredItems.map((item, index) => (
              <Card 
                key={item.id} 
                className="overflow-hidden hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 group animate-fade-in bg-card"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={menuImages[item.name] || tajineImage}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold mb-3">{item.name}</h3>
                  <p className="text-muted-foreground mb-6 text-base leading-relaxed">{item.description}</p>
                  <p className="text-3xl font-bold text-primary">{item.price} DH</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link to="/menu">
              <Button size="lg" className="text-lg px-8 py-6 hover-scale">
                Voir Tout le Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
