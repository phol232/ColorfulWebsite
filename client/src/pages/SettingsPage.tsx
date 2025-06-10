import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Upload, User, Save, Eye, EyeOff } from "lucide-react";
import { API_URL } from "@/config";

interface UserProfile {
    usrp_id: string;
    usrp_nombre: string;
    usrp_apellido: string;
    usrp_telefono: string;
    usrp_direccion: string;
    usrp_genero: string;
    usrp_fecha_nacimiento: string;
    usrp_imagen: string;
}

const SettingsPage: React.FC = () => {
    const { userProfile, updateUserProfile } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        usrp_id: "",
        usrp_nombre: "",
        usrp_apellido: "",
        usrp_telefono: "",
        usrp_direccion: "",
        usrp_genero: "",
        usrp_fecha_nacimiento: "",
        usrp_imagen: ""
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>("");

    useEffect(() => {
        console.log("SettingsPage - userProfile:", userProfile);
        if (userProfile?.userId) {
            fetchUserProfile();
        }
    }, [userProfile?.userId]);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log("Fetching profile for user ID:", userProfile?.userId);
            console.log("API URL:", `${API_URL}/api/perfil/${userProfile?.userId}`);

            const response = await fetch(`${API_URL}/api/perfil/${userProfile?.userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);

            if (response.ok) {
                const data = await response.json();
                console.log("RAW Profile data received:", data);
                console.log("Data structure:", JSON.stringify(data, null, 2));
                console.log("Data type:", typeof data);
                console.log("Data keys:", Object.keys(data));

                // Intentar diferentes formatos de respuesta de Laravel
                let profileData = data;

                // Si la respuesta tiene un campo 'data', 'perfil', 'usuario', etc.
                if (data.data) {
                    console.log("Using data.data");
                    profileData = data.data;
                } else if (data.perfil) {
                    console.log("Using data.perfil");
                    profileData = data.perfil;
                } else if (data.usuario && data.usuario.perfil) {
                    console.log("Using data.usuario.perfil");
                    profileData = data.usuario.perfil;
                }

                console.log("Final profileData:", profileData);
                console.log("ProfileData keys:", Object.keys(profileData));

                // Normalizar datos para evitar valores null
                const normalizedProfile = {
                    usrp_id: profileData.usrp_id || "",
                    usrp_nombre: profileData.usrp_nombre || "",
                    usrp_apellido: profileData.usrp_apellido || "",
                    usrp_telefono: profileData.usrp_telefono || "",
                    usrp_direccion: profileData.usrp_direccion || "",
                    usrp_genero: profileData.usrp_genero || "",
                    usrp_fecha_nacimiento: profileData.usrp_fecha_nacimiento || "",
                    usrp_imagen: profileData.usrp_imagen || ""
                };

                console.log("Normalized profile:", normalizedProfile);
                setProfile(normalizedProfile);

                if (profileData.usrp_imagen) {
                    setPreviewImage(`${API_URL}/storage/${profileData.usrp_imagen}`);
                }
            } else {
                console.error("Error response:", response.status);
                const errorText = await response.text();
                console.error("Error details:", errorText);
                toast({
                    title: "Error",
                    description: `Error al cargar perfil: ${response.status}`,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Error al cargar perfil:", error);
            toast({
                title: "Error",
                description: "No se pudo cargar la información del perfil",
                variant: "destructive"
            });
        }
    };

    const handleInputChange = (field: keyof UserProfile, value: string) => {
        console.log("=== INPUT CHANGE ===");
        console.log("Campo:", field);
        console.log("Valor nuevo:", value);
        console.log("Valor anterior:", profile[field]);
        console.log("Tipo de valor:", typeof value);
        console.log("Longitud valor:", value?.length);

        const updatedProfile = {
            ...profile,
            [field]: value
        };

        console.log("Profile actualizado:", updatedProfile);
        console.log("===================");

        setProfile(updatedProfile);
    };

    // Función removida - ya no se permite cambiar la foto de perfil

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log("=== ENVIANDO FORMULARIO ===");
            console.log("Profile completo antes de enviar:", profile);
            console.log("Usuario ID:", userProfile?.userId);
            console.log("Selected file:", selectedFile);

            const token = localStorage.getItem("token");
            const formData = new FormData();

            // Log de cada campo que se agrega al FormData (excluyendo campos no editables)
            const editableFields = ['usrp_telefono', 'usrp_direccion', 'usrp_genero', 'usrp_fecha_nacimiento'];

            editableFields.forEach(key => {
                if (profile[key as keyof UserProfile]) {
                    const valor = profile[key as keyof UserProfile];
                    console.log(`Agregando al FormData: ${key} = "${valor}" (${typeof valor})`);
                    formData.append(key, valor);
                } else {
                    console.log(`NO agregando al FormData (vacío): ${key} = "${profile[key as keyof UserProfile]}"`);
                }
            });

            formData.append('_method', 'PUT');

            const requestUrl = `${API_URL}/api/perfil/${userProfile?.userId}`;
            console.log('=== DEBUGGING COMPLETO ===');
            console.log('API_URL:', API_URL);
            console.log('URL completa:', requestUrl);
            console.log('Usuario ID:', userProfile?.userId);
            console.log('Token presente:', !!token);
            console.log('Token preview:', token?.substring(0, 20) + '...');
            console.log('Method: POST (con _method=PUT)');
            console.log('Headers que se enviarán:', {
                Authorization: `Bearer ${token}`
            });
            console.log('========================');

            console.log('2. Enviando petición principal...');
            const response = await fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            console.log('=== RESPUESTA RECIBIDA ===');
            console.log('Status:', response.status);
            console.log('Status Text:', response.statusText);
            console.log('URL final:', response.url);
            console.log('Redirected:', response.redirected);
            console.log('========================');

            if (response.ok) {
                const data = await response.json();

                console.log("=== RESPUESTA DEL SERVIDOR ===");
                console.log("Response status:", response.status);
                console.log("Respuesta completa:", data);
                console.log("Datos del perfil en respuesta:", data.perfil);
                console.log("=============================");

                // Normalizar datos actualizados
                const normalizedProfile = {
                    usrp_id: data.perfil.usrp_id || "",
                    usrp_nombre: data.perfil.usrp_nombre || "",
                    usrp_apellido: data.perfil.usrp_apellido || "",
                    usrp_telefono: data.perfil.usrp_telefono || "",
                    usrp_direccion: data.perfil.usrp_direccion || "",
                    usrp_genero: data.perfil.usrp_genero || "",
                    usrp_fecha_nacimiento: data.perfil.usrp_fecha_nacimiento || "",
                    usrp_imagen: data.perfil.usrp_imagen || ""
                };

                console.log("Perfil normalizado después de actualizar:", normalizedProfile);

                setProfile(normalizedProfile);

                if (updateUserProfile) {
                    updateUserProfile({
                        ...userProfile,
                        perfil: data.perfil
                    });
                }

                toast({
                    title: "Éxito",
                    description: "Perfil actualizado correctamente"
                });

                // Actualizar imagen de vista previa si se subió una nueva
                if (data.perfil.usrp_imagen) {
                    setPreviewImage(`${API_URL}/storage/${data.perfil.usrp_imagen}`);
                }
            } else {
                throw new Error('Error al actualizar perfil');
            }
        } catch (error) {
            console.error("Error:", error);
            toast({
                title: "Error",
                description: "No se pudo actualizar el perfil",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                    <p className="text-muted-foreground">
                        Gestiona tu información personal y preferencias de cuenta.
                    </p>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                            <CardDescription>
                                Actualiza tu información personal y foto de perfil.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Foto de perfil - Solo lectura */}
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={previewImage} alt="Foto de perfil" />
                                        <AvatarFallback>
                                            <User className="h-10 w-10" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Foto de perfil de Google
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            La imagen proviene de tu cuenta de Google y no puede ser modificada aquí
                                        </p>
                                    </div>
                                </div>

                                {/* Información básica - Solo lectura para nombre y apellido */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre</Label>
                                        <Input
                                            id="nombre"
                                            value={profile.usrp_nombre}
                                            placeholder="Tu nombre"
                                            disabled
                                            className="bg-gray-50 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Información de Google (no editable)
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apellido">Apellido</Label>
                                        <Input
                                            id="apellido"
                                            value={profile.usrp_apellido}
                                            placeholder="Tu apellido"
                                            disabled
                                            className="bg-gray-50 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Información de Google (no editable)
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="telefono">Teléfono</Label>
                                        <Input
                                            id="telefono"
                                            value={profile.usrp_telefono}
                                            onChange={(e) => handleInputChange('usrp_telefono', e.target.value)}
                                            placeholder="Tu número de teléfono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="genero">Género</Label>
                                        <Select
                                            value={profile.usrp_genero}
                                            onValueChange={(value) => handleInputChange('usrp_genero', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona tu género" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="masculino">Masculino</SelectItem>
                                                <SelectItem value="femenino">Femenino</SelectItem>
                                                <SelectItem value="otro">Otro</SelectItem>
                                                <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                                    <Input
                                        id="fecha_nacimiento"
                                        type="date"
                                        value={profile.usrp_fecha_nacimiento}
                                        onChange={(e) => handleInputChange('usrp_fecha_nacimiento', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="direccion">Dirección</Label>
                                    <Textarea
                                        id="direccion"
                                        value={profile.usrp_direccion}
                                        onChange={(e) => handleInputChange('usrp_direccion', e.target.value)}
                                        placeholder="Tu dirección completa"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Save className="mr-2 h-4 w-4" />
                                        Guardar cambios
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};

export default SettingsPage;