import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import tajineImage from "@/assets/tajine-poulet.jpg";
import couscousImage from "@/assets/couscous-royal.jpg";
import pastillaImage from "@/assets/pastilla.jpg";
import hariraImage from "@/assets/harira.jpg";
import theImage from "@/assets/the-menthe.jpg";
import gazellImage from "@/assets/cornes-gazelle.jpg";
import menuBg from "@/assets/menu-bg.jpg";

const menuImages: Record<string, string> = {
  'Tajine Poulet': tajineImage,
  'Couscous Royal': couscousImage,
  'Pastilla au Poulet': pastillaImage,
  'Harira': hariraImage,
  'Thé à la Menthe': theImage,
  'Cornes de Gazelle': gazellImage,
};

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");

  useEffect(() => {
    const fetchMenuItems = async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('category', { ascending: true });
      
      if (data) setMenuItems(data);
    };
    fetchMenuItems();
  }, []);

  const categories = ["Tous", ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = selectedCategory === "Tous" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <section className="relative py-28 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={menuBg} 
            alt="Restaurant" 
            className="w-full h-full object-cover animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <Link to="/">
            <Button variant="ghost" className="mb-6 text-white hover:bg-white/20 hover-scale">
              <Home className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <h1 className="text-6xl font-bold text-white mb-6 animate-fade-in drop-shadow-2xl">Notre Menu</h1>
          <p className="text-2xl text-white/90 animate-fade-in animation-delay-200 drop-shadow-lg">Découvrez nos délicieuses spécialités</p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-10 px-4 bg-white/80 backdrop-blur-sm border-b sticky top-0 z-20 shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category, index) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer px-8 py-3 text-base hover-scale transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <Card 
                key={item.id} 
                className="overflow-hidden hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2 group animate-fade-in bg-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                  <img 
                    src={item.image_url || menuImages[item.name] || tajineImage}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-semibold">{item.name}</h3>
                    <Badge variant="secondary" className="ml-2 px-3 py-1">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{item.description}</p>
                  <p className="text-3xl font-bold text-primary">{item.price} DH</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;
