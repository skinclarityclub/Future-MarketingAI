"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Plus, Edit2, Trash2, Save, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Note: Using alert for demo - replace with proper toast when available
// import { toast } from "sonner";
import {
  PersonalityProfile,
  SystemMessageConfig,
  AIConfigurationService,
} from "@/lib/ai-configuration/types";

// Temporary toast replacement
const toast = {
  success: (message: string) => console.log("✅ Success:", message),
  error: (message: string) => console.error("❌ Error:", message),
};

export default function AIConfigurationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [personalityProfiles, setPersonalityProfiles] = useState<
    PersonalityProfile[]
  >([]);
  const [systemMessages, setSystemMessages] = useState<SystemMessageConfig[]>(
    []
  );
  const [activeProfile, setActiveProfile] = useState<string>("");
  const [selectedProfile, setSelectedProfile] =
    useState<PersonalityProfile | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load configurations on component mount
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setIsLoading(true);
    try {
      const service = new AIConfigurationService();
      const [profiles, messages, activeProfileId] = await Promise.all([
        service.getPersonalityProfiles(),
        service.getSystemMessages(),
        service.getActivePersonalityProfile(),
      ]);

      setPersonalityProfiles(profiles);
      setSystemMessages(messages);
      setActiveProfile(activeProfileId);
    } catch (error) {
      toast.error("Fout bij laden van configuraties");
      console.error("Error loading configurations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      const service = new AIConfigurationService();
      await service.saveConfigurations({
        personalityProfiles,
        systemMessages,
        activeProfileId: activeProfile,
      });
      toast.success("Configuratie succesvol opgeslagen");
    } catch (error) {
      toast.error("Fout bij opslaan van configuratie");
      console.error("Error saving configurations:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateProfile = () => {
    setSelectedProfile(null);
    setIsCreateModalOpen(true);
  };

  const handleEditProfile = (profile: PersonalityProfile) => {
    setSelectedProfile(profile);
    setIsEditModalOpen(true);
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (profileId === activeProfile) {
      toast.error("Kan actieve persoonlijkheid niet verwijderen");
      return;
    }

    if (
      confirm("Weet je zeker dat je deze persoonlijkheid wilt verwijderen?")
    ) {
      setPersonalityProfiles(prev => prev.filter(p => p.id !== profileId));
      toast.success("Persoonlijkheid verwijderd");
    }
  };

  const handleSetActiveProfile = (profileId: string) => {
    setActiveProfile(profileId);
    toast.success("Actieve persoonlijkheid gewijzigd");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Configuraties laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Configuratie
        </h1>
        <p className="text-muted-foreground mt-2">
          Beheer AI persoonlijkheidsprofielen en systeem berichten voor de
          Business Intelligence Assistant
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Actief:{" "}
            {personalityProfiles.find(p => p.id === activeProfile)?.name ||
              "Geen"}
          </Badge>
          {personalityProfiles.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {personalityProfiles.length} profiel
              {personalityProfiles.length !== 1 ? "en" : ""} beschikbaar
            </span>
          )}
        </div>
        <Button
          onClick={handleSaveConfiguration}
          disabled={isSaving}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Opslaan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Configuratie Opslaan
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="personalities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personalities">
            Persoonlijkheidsprofielen
          </TabsTrigger>
          <TabsTrigger value="messages">Systeem Berichten</TabsTrigger>
        </TabsList>

        <TabsContent value="personalities" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Persoonlijkheidsprofielen</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Configureer hoe de AI assistant communiceert met gebruikers
                </p>
              </div>
              <Button
                onClick={handleCreateProfile}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Profiel
              </Button>
            </CardHeader>
            <CardContent>
              {personalityProfiles.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Geen persoonlijkheidsprofielen geconfigureerd. Maak je
                    eerste profiel aan om te beginnen.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {personalityProfiles.map(profile => (
                    <Card
                      key={profile.id}
                      className={`cursor-pointer transition-all ${
                        profile.id === activeProfile
                          ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {profile.name}
                          </CardTitle>
                          <div className="flex items-center gap-1">
                            {profile.id === activeProfile && (
                              <Badge variant="default" className="text-xs">
                                Actief
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProfile(profile)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProfile(profile.id)}
                              disabled={profile.id === activeProfile}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {profile.description}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Toon:</span>
                            <Badge variant="outline">{profile.tone}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Stijl:</span>
                            <Badge variant="outline">{profile.style}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Formaliteit:</span>
                            <Badge variant="outline">{profile.formality}</Badge>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <Button
                          variant={
                            profile.id === activeProfile ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handleSetActiveProfile(profile.id)}
                          disabled={profile.id === activeProfile}
                          className="w-full"
                        >
                          {profile.id === activeProfile
                            ? "Actief Profiel"
                            : "Activeer Profiel"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <SystemMessagesTab
            messages={systemMessages}
            onUpdateMessages={setSystemMessages}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Profile Modal */}
      <PersonalityProfileModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedProfile(null);
        }}
        profile={selectedProfile}
        onSave={profile => {
          if (selectedProfile) {
            // Edit existing
            setPersonalityProfiles(prev =>
              prev.map(p => (p.id === profile.id ? profile : p))
            );
          } else {
            // Create new
            setPersonalityProfiles(prev => [...prev, profile]);
          }
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedProfile(null);
          toast.success(
            selectedProfile ? "Profiel bijgewerkt" : "Profiel aangemaakt"
          );
        }}
      />
    </div>
  );
}

// Separate component for System Messages tab
function SystemMessagesTab({
  messages,
  onUpdateMessages,
}: {
  messages: SystemMessageConfig[];
  onUpdateMessages: (messages: SystemMessageConfig[]) => void;
}) {
  const [editingMessage, setEditingMessage] =
    useState<SystemMessageConfig | null>(null);

  const handleUpdateMessage = (updatedMessage: SystemMessageConfig) => {
    onUpdateMessages(
      messages.map(msg => (msg.id === updatedMessage.id ? updatedMessage : msg))
    );
    setEditingMessage(null);
    toast.success("Systeem bericht bijgewerkt");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Systeem Berichten</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configureer hoe de AI assistant zich gedraagt in verschillende
          contexten
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.map(message => (
          <Card key={message.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{message.name}</h4>
                  <Badge variant="outline">{message.context}</Badge>
                  <Switch
                    checked={message.enabled}
                    onCheckedChange={enabled => {
                      const updated = { ...message, enabled };
                      handleUpdateMessage(updated);
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {message.description}
                </p>
                <div className="bg-muted/50 p-3 rounded text-sm">
                  {message.content.substring(0, 150)}
                  {message.content.length > 150 && "..."}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingMessage(message)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}

        {editingMessage && (
          <SystemMessageEditor
            message={editingMessage}
            onSave={handleUpdateMessage}
            onCancel={() => setEditingMessage(null)}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Placeholder components - will be implemented next
function PersonalityProfileModal({
  isOpen,
  onClose,
  profile,
  onSave: _onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: PersonalityProfile | null;
  onSave: (profile: PersonalityProfile) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {profile ? "Persoonlijkheid Bewerken" : "Nieuwe Persoonlijkheid"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p className="text-muted-foreground">
            Persoonlijkheid modal wordt geïmplementeerd in de volgende stap...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SystemMessageEditor({
  message: _message,
  onSave: _onSave,
  onCancel: _onCancel,
}: {
  message: SystemMessageConfig;
  onSave: (message: SystemMessageConfig) => void;
  onCancel: () => void;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <p className="text-muted-foreground">
        Systeem bericht editor wordt geïmplementeerd in de volgende stap...
      </p>
    </div>
  );
}
