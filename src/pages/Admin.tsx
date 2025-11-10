import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LogOut, Home, CheckCircle, XCircle, Calendar, Clock, Users, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import tajineImage from "@/assets/tajine-poulet.jpg";
import couscousImage from "@/assets/couscous-royal.jpg";
import pastillaImage from "@/assets/pastilla.jpg";
import hariraImage from "@/assets/harira.jpg";
import theImage from "@/assets/the-menthe.jpg";
import gazellImage from "@/assets/cornes-gazelle.jpg";

const menuImages: Record<string, string> = {
  'Tajine Poulet': tajineImage,
  'Couscous Royal': couscousImage,
  'Pastilla au Poulet': pastillaImage,
  'Harira': hariraImage,
  'Thé à la Menthe': theImage,
  'Cornes de Gazelle': gazellImage,
};
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
}

interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  special_requests: string | null;
  status: string;
  created_at: string;
}

const Admin = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Plats Principaux",
    image_url: "",
    is_available: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchMenuItems();
    fetchReservations();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roles) {
      toast.error("Accès non autorisé. Seuls les administrateurs peuvent accéder à cette page.");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const fetchMenuItems = async () => {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true });
    
    if (data) setMenuItems(data);
  };

  const fetchReservations = async () => {
    const { data } = await (supabase as any)
      .from('reservations')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false });
    
    if (data) setReservations(data);
  };

  const handleReservationStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    const { error } = await (supabase as any)
      .from('reservations')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success(status === 'confirmed' ? "Réservation confirmée!" : "Réservation annulée");
      fetchReservations();
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette réservation?")) return;

    const { error } = await (supabase as any)
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Réservation supprimée!");
      fetchReservations();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Déconnexion réussie");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Plats Principaux",
      image_url: "",
      is_available: true,
    });
    setEditingItem(null);
    setImageFile(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url || "",
      is_available: item.is_available,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erreur lors de l'upload de l'image");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = formData.image_url;

    // Upload image if a file is selected
    if (imageFile) {
      const uploadedUrl = await handleImageUpload(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        return; // Stop if image upload failed
      }
    }

    const itemData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image_url: imageUrl || null,
      is_available: formData.is_available,
    };

    if (editingItem) {
      const { error } = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', editingItem.id);

      if (error) {
        toast.error("Erreur lors de la modification");
      } else {
        toast.success("Article modifié avec succès!");
        fetchMenuItems();
        setDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('menu_items')
        .insert([itemData]);

      if (error) {
        toast.error("Erreur lors de l'ajout");
      } else {
        toast.success("Article ajouté avec succès!");
        fetchMenuItems();
        setDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article?")) return;

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Article supprimé!");
      fetchMenuItems();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="bg-hero-gradient py-10 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link to="/">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <Home className="mr-2 h-4 w-4" />
                Retour au Site
              </Button>
            </Link>
            <Button variant="secondary" onClick={handleLogout} className="hover-scale">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
          <h1 className="text-5xl font-bold text-white animate-fade-in">Panneau Admin</h1>
          <p className="text-white/90 text-xl mt-3 animate-fade-in animation-delay-200">Gérez votre menu en toute simplicité</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="menu">Gestion du Menu</TabsTrigger>
            <TabsTrigger value="reservations">Réservations</TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">Gestion du Menu</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Modifier l'Article" : "Nouvel Article"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nom *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Prix (DH) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Catégorie *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entrées">Entrées</SelectItem>
                            <SelectItem value="Plats Principaux">Plats Principaux</SelectItem>
                            <SelectItem value="Desserts">Desserts</SelectItem>
                            <SelectItem value="Boissons">Boissons</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="image_file">Image (PC ou Téléphone)</Label>
                        <Input
                          id="image_file"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImageFile(file);
                              // Clear URL field if file is selected
                              setFormData({ ...formData, image_url: "" });
                            }
                          }}
                          disabled={uploadingImage}
                        />
                        {imageFile && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Fichier sélectionné: {imageFile.name}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Ou
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="image_url">URL de l'Image</Label>
                        <Input
                          id="image_url"
                          type="url"
                          value={formData.image_url}
                          onChange={(e) => {
                            setFormData({ ...formData, image_url: e.target.value });
                            // Clear file if URL is entered
                            if (e.target.value) {
                              setImageFile(null);
                            }
                          }}
                          placeholder="https://..."
                          disabled={uploadingImage || !!imageFile}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_available"
                        checked={formData.is_available}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                      />
                      <Label htmlFor="is_available">Article disponible</Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={uploadingImage}>
                      {uploadingImage ? "Upload en cours..." : editingItem ? "Modifier" : "Ajouter"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {menuItems.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                      <img 
                        src={menuImages[item.name] || tajineImage}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-2xl font-semibold">{item.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.is_available ? 'Disponible' : 'Indisponible'}
                            </span>
                          </div>
                          <p className="text-muted-foreground mb-4 leading-relaxed">{item.description}</p>
                          <div className="flex gap-6 text-base">
                            <span className="font-bold text-primary text-xl">{item.price} DH</span>
                            <span className="text-muted-foreground">📍 {item.category}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(item)} className="hover-scale">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)} className="hover-scale">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reservations">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold">Gestion des Réservations</h2>
              <p className="text-muted-foreground mt-2">
                {reservations.length} réservation{reservations.length > 1 ? 's' : ''} au total
              </p>
            </div>

            <div className="grid gap-6">
              {reservations.length === 0 ? (
                <Card className="p-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">Aucune réservation pour le moment</p>
                </Card>
              ) : (
                reservations.map((reservation, index) => (
                  <Card 
                    key={reservation.id} 
                    className="overflow-hidden hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-2xl font-semibold">{reservation.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {reservation.status === 'confirmed' ? 'Confirmée' :
                               reservation.status === 'cancelled' ? 'Annulée' : 'En attente'}
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{reservation.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{reservation.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(reservation.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{reservation.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{reservation.guests} personne{reservation.guests > 1 ? 's' : ''}</span>
                            </div>
                          </div>

                          {reservation.special_requests && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium mb-1">Demandes spéciales:</p>
                              <p className="text-sm text-muted-foreground">{reservation.special_requests}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          {reservation.status !== 'confirmed' && (
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleReservationStatus(reservation.id, 'confirmed')}
                              className="hover-scale text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Confirmer"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {reservation.status !== 'cancelled' && (
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleReservationStatus(reservation.id, 'cancelled')}
                              className="hover-scale text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              title="Annuler"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            onClick={() => handleDeleteReservation(reservation.id)}
                            className="hover-scale"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
