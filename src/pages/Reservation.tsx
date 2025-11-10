import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, Clock, Users, Phone, Mail, Home } from "lucide-react";
import reservationBg from "@/assets/reservation-bg.jpg";

const Reservation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "",
    special_requests: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await (supabase as any)
        .from('reservations')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            date: formData.date,
            time: formData.time,
            guests: parseInt(formData.guests),
            special_requests: formData.special_requests || null,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Réservation confirmée !",
        description: "Nous vous contacterons bientôt pour confirmer votre réservation.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        guests: "",
        special_requests: "",
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la réservation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src={reservationBg} 
          alt="Restaurant" 
          className="w-full h-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl p-8 md:p-12 bg-card/95 backdrop-blur-md shadow-2xl animate-fade-in border-2">
          <Link to="/">
            <Button variant="ghost" className="mb-6 hover-scale">
              <Home className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-center">Réserver une Table</h1>
          <p className="text-muted-foreground text-center mb-8 text-lg">
            Rejoignez-nous pour une expérience culinaire inoubliable
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 animate-fade-in animation-delay-100">
                <Label htmlFor="name" className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Nom Complet
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-12 text-base"
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2 animate-fade-in animation-delay-200">
                <Label htmlFor="email" className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 text-base"
                  placeholder="votre@email.com"
                />
              </div>

              <div className="space-y-2 animate-fade-in animation-delay-300">
                <Label htmlFor="phone" className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="h-12 text-base"
                  placeholder="0612345678"
                />
              </div>

              <div className="space-y-2 animate-fade-in animation-delay-400">
                <Label htmlFor="guests" className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Nombre de Personnes
                </Label>
                <Input
                  id="guests"
                  name="guests"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.guests}
                  onChange={handleChange}
                  required
                  className="h-12 text-base"
                  placeholder="2"
                />
              </div>

              <div className="space-y-2 animate-fade-in animation-delay-500">
                <Label htmlFor="date" className="text-base flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="h-12 text-base"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2 animate-fade-in animation-delay-600">
                <Label htmlFor="time" className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Heure
                </Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="h-12 text-base"
                />
              </div>
            </div>

            <div className="space-y-2 animate-fade-in animation-delay-700">
              <Label htmlFor="special_requests" className="text-base">
                Demandes Spéciales (optionnel)
              </Label>
              <Textarea
                id="special_requests"
                name="special_requests"
                value={formData.special_requests}
                onChange={handleChange}
                placeholder="Allergies, préférences de table, occasion spéciale..."
                className="min-h-[100px] text-base"
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-14 text-lg hover-scale animate-fade-in animation-delay-800 shadow-warm-glow"
              disabled={isLoading}
            >
              {isLoading ? "Réservation en cours..." : "Confirmer la Réservation"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Reservation;
