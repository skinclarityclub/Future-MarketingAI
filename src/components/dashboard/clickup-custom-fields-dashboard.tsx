"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Database,
  Map,
  BarChart3,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  Zap,
  Filter,
  Download,
  Upload,
} from "lucide-react";

// Types
interface CustomField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  hide_from_guests: boolean;
  value?: any;
  type_config?: {
    default?: any;
    placeholder?: string;
    options?: Array<{
      id: string;
      name: string;
      color?: string;
    }>;
    precision?: number;
    currency_type?: string;
  };
}

interface MetadataMapping {
  id: string;
  platform_field: string;
  clickup_field_id: string;
  clickup_field_name: string;
  field_type: string;
  mapping_config: {
    sync_direction: "to_clickup" | "from_clickup" | "bidirectional";
    transform_rule?: string;
    default_value?: any;
    validation_rule?: string;
  };
  workspace_id?: string;
  list_id?: string;
  is_active: boolean;
}

interface FieldStats {
  total_fields: number;
  field_types: Record<string, number>;
  required_fields: number;
  optional_fields: number;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
    usage_percentage: number;
  }>;
}

const FIELD_TYPE_ICONS = {
  text: FileText,
  number: BarChart3,
  currency: Target,
  date: Clock,
  dropdown: Settings,
  checkbox: CheckCircle2,
  url: Zap,
  email: Target,
  phone: Target,
  people: Target,
  rating: BarChart3,
  progress: BarChart3,
};

export function ClickUpCustomFieldsDashboard() {
  const [activeTab, setActiveTab] = useState("fields");
  const [fields, setFields] = useState<CustomField[]>([]);
  const [mappings, setMappings] = useState<MetadataMapping[]>([]);
  const [fieldStats, setFieldStats] = useState<FieldStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedListId, setSelectedListId] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");

  // New field form
  const [newFieldDialog, setNewFieldDialog] = useState(false);
  const [newFieldForm, setNewFieldForm] = useState({
    name: "",
    type: "text",
    required: false,
    hide_from_guests: false,
    placeholder: "",
    options: [] as Array<{ name: string; color: string }>,
  });

  // New mapping form
  const [newMappingDialog, setNewMappingDialog] = useState(false);
  const [newMappingForm, setNewMappingForm] = useState({
    platform_field: "",
    clickup_field_id: "",
    field_type: "text",
    sync_direction: "bidirectional" as
      | "to_clickup"
      | "from_clickup"
      | "bidirectional",
    transform_rule: "",
    default_value: "",
    validation_rule: "",
  });

  // Load data functions
  const loadFields = async () => {
    if (!selectedListId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/clickup/custom-fields?action=list_fields&list_id=${selectedListId}`
      );
      const data = await response.json();

      if (data.success) {
        setFields(data.data.fields);
      }
    } catch (error) {
      console.error("Error loading fields:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMappings = async () => {
    setIsLoading(true);
    try {
      const url = selectedWorkspaceId
        ? `/api/clickup/custom-fields?action=metadata_mappings&workspace_id=${selectedWorkspaceId}`
        : "/api/clickup/custom-fields?action=metadata_mappings";

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setMappings(data.data.mappings);
      }
    } catch (error) {
      console.error("Error loading mappings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFieldStats = async () => {
    if (!selectedListId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/clickup/custom-fields?action=field_stats&list_id=${selectedListId}`
      );
      const data = await response.json();

      if (data.success) {
        setFieldStats(data.data);
      }
    } catch (error) {
      console.error("Error loading field stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new field
  const createField = async () => {
    if (!selectedListId || !newFieldForm.name) return;

    setIsLoading(true);
    try {
      const fieldData = {
        name: newFieldForm.name,
        type: newFieldForm.type,
        required: newFieldForm.required,
        hide_from_guests: newFieldForm.hide_from_guests,
        type_config: {
          placeholder: newFieldForm.placeholder,
          ...(newFieldForm.type === "dropdown" &&
            newFieldForm.options.length > 0 && {
              options: newFieldForm.options.map((opt, index) => ({
                id: `option_${index}`,
                name: opt.name,
                color: opt.color,
              })),
            }),
        },
      };

      const response = await fetch(
        "/api/clickup/custom-fields?action=create_field",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            list_id: selectedListId,
            field: fieldData,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setNewFieldDialog(false);
        setNewFieldForm({
          name: "",
          type: "text",
          required: false,
          hide_from_guests: false,
          placeholder: "",
          options: [],
        });
        loadFields();
      }
    } catch (error) {
      console.error("Error creating field:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new mapping
  const createMapping = async () => {
    if (!newMappingForm.platform_field || !newMappingForm.clickup_field_id)
      return;

    setIsLoading(true);
    try {
      const mappingData = {
        platform_field: newMappingForm.platform_field,
        clickup_field_id: newMappingForm.clickup_field_id,
        clickup_field_name:
          fields.find(f => f.id === newMappingForm.clickup_field_id)?.name ||
          "",
        field_type: newMappingForm.field_type,
        mapping_config: {
          sync_direction: newMappingForm.sync_direction,
          transform_rule: newMappingForm.transform_rule || undefined,
          default_value: newMappingForm.default_value || undefined,
          validation_rule: newMappingForm.validation_rule || undefined,
        },
        workspace_id: selectedWorkspaceId,
        list_id: selectedListId,
      };

      const response = await fetch(
        "/api/clickup/custom-fields?action=create_metadata_mapping",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mappingData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setNewMappingDialog(false);
        setNewMappingForm({
          platform_field: "",
          clickup_field_id: "",
          field_type: "text",
          sync_direction: "bidirectional",
          transform_rule: "",
          default_value: "",
          validation_rule: "",
        });
        loadMappings();
      }
    } catch (error) {
      console.error("Error creating mapping:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup default content fields
  const setupContentFields = async () => {
    if (!selectedListId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        "/api/clickup/custom-fields?action=setup_content_fields",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ list_id: selectedListId }),
        }
      );

      const data = await response.json();

      if (data.success) {
        loadFields();
        loadFieldStats();
      }
    } catch (error) {
      console.error("Error setting up content fields:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when list/workspace changes
  useEffect(() => {
    if (selectedListId) {
      loadFields();
      loadFieldStats();
    }
  }, [selectedListId]);

  useEffect(() => {
    loadMappings();
  }, [selectedWorkspaceId]);

  const addDropdownOption = () => {
    setNewFieldForm(prev => ({
      ...prev,
      options: [...prev.options, { name: "", color: "#3B82F6" }],
    }));
  };

  const updateDropdownOption = (
    index: number,
    field: "name" | "color",
    value: string
  ) => {
    setNewFieldForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const removeDropdownOption = (index: number) => {
    setNewFieldForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                ClickUp Custom Fields & Metadata Beheer
              </CardTitle>
              <CardDescription>
                Beheer aangepaste velden en metadata synchronisatie voor ClickUp
                integratie
              </CardDescription>
            </div>

            <div className="flex items-center gap-4">
              <NormalButton
                onClick={setupContentFields}
                disabled={!selectedListId || isLoading}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Setup Content Fields
              </NormalButton>

              <NormalButton
                onClick={() => {
                  loadFields();
                  loadMappings();
                  loadFieldStats();
                }}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Vernieuwen
              </NormalButton>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="list-id">ClickUp List ID</Label>
              <Input
                id="list-id"
                value={selectedListId}
                onChange={e => setSelectedListId(e.target.value)}
                placeholder="Voer ClickUp List ID in"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspace-id">Workspace ID (optioneel)</Label>
              <Input
                id="workspace-id"
                value={selectedWorkspaceId}
                onChange={e => setSelectedWorkspaceId(e.target.value)}
                placeholder="Voer Workspace ID in"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="mappings">Metadata Mappings</TabsTrigger>
          <TabsTrigger value="statistics">Statistieken</TabsTrigger>
          <TabsTrigger value="management">Beheer</TabsTrigger>
        </TabsList>

        {/* Custom Fields Tab */}
        <TabsContent value="fields" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Custom Fields Overzicht</CardTitle>
                <Dialog open={newFieldDialog} onOpenChange={setNewFieldDialog}>
                  <DialogTrigger asChild>
                    <NormalButton className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Nieuw Veld
                    </NormalButton>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Nieuw Custom Field Maken</DialogTitle>
                      <DialogDescription>
                        Maak een nieuw aangepast veld voor de geselecteerde
                        ClickUp lijst
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="field-name">Veld Naam</Label>
                          <Input
                            id="field-name"
                            value={newFieldForm.name}
                            onChange={e =>
                              setNewFieldForm(prev => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Veld naam"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="field-type">Veld Type</Label>
                          <Select
                            value={newFieldForm.type}
                            onValueChange={value =>
                              setNewFieldForm(prev => ({
                                ...prev,
                                type: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="currency">Currency</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="dropdown">Dropdown</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                              <SelectItem value="url">URL</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="rating">Rating</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="field-placeholder">
                          Placeholder Tekst
                        </Label>
                        <Input
                          id="field-placeholder"
                          value={newFieldForm.placeholder}
                          onChange={e =>
                            setNewFieldForm(prev => ({
                              ...prev,
                              placeholder: e.target.value,
                            }))
                          }
                          placeholder="Placeholder tekst voor het veld"
                        />
                      </div>

                      {newFieldForm.type === "dropdown" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Dropdown Opties</Label>
                            <NormalButton
                              onClick={addDropdownOption}
                              type="button"
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="h-4 w-4" />
                            </NormalButton>
                          </div>

                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {newFieldForm.options.map((option, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  value={option.name}
                                  onChange={e =>
                                    updateDropdownOption(
                                      index,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Optie naam"
                                />
                                <Input
                                  type="color"
                                  value={option.color}
                                  onChange={e =>
                                    updateDropdownOption(
                                      index,
                                      "color",
                                      e.target.value
                                    )
                                  }
                                  className="w-16"
                                />
                                <NormalButton
                                  onClick={() => removeDropdownOption(index)}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </NormalButton>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="required"
                            checked={newFieldForm.required}
                            onCheckedChange={checked =>
                              setNewFieldForm(prev => ({
                                ...prev,
                                required: checked,
                              }))
                            }
                          />
                          <Label htmlFor="required">Verplicht Veld</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="hide-guests"
                            checked={newFieldForm.hide_from_guests}
                            onCheckedChange={checked =>
                              setNewFieldForm(prev => ({
                                ...prev,
                                hide_from_guests: checked,
                              }))
                            }
                          />
                          <Label htmlFor="hide-guests">
                            Verberg voor Gasten
                          </Label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <NormalButton
                          variant="outline"
                          onClick={() => setNewFieldDialog(false)}
                        >
                          Annuleren
                        </NormalButton>
                        <NormalButton
                          onClick={createField}
                          disabled={!newFieldForm.name || isLoading}
                        >
                          {isLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Veld Maken
                            </>
                          )}
                        </NormalButton>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {selectedListId
                    ? "Geen custom fields gevonden voor deze lijst"
                    : "Selecteer een List ID om custom fields te bekijken"}
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map(field => {
                    const IconComponent =
                      FIELD_TYPE_ICONS[
                        field.type as keyof typeof FIELD_TYPE_ICONS
                      ] || FileText;

                    return (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-blue-500" />
                          <div>
                            <h3 className="font-medium">{field.name}</h3>
                            <p className="text-sm text-gray-600">
                              Type: {field.type} | ID: {field.id}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {field.required && (
                            <Badge variant="destructive">Verplicht</Badge>
                          )}
                          {field.hide_from_guests && (
                            <Badge variant="secondary">Verborgen</Badge>
                          )}
                          <Badge variant="outline">{field.type}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metadata Mappings Tab */}
        <TabsContent value="mappings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Metadata Mappings</CardTitle>
                <Dialog
                  open={newMappingDialog}
                  onOpenChange={setNewMappingDialog}
                >
                  <DialogTrigger asChild>
                    <NormalButton className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Nieuwe Mapping
                    </NormalButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nieuwe Metadata Mapping</DialogTitle>
                      <DialogDescription>
                        Maak een mapping tussen platform velden en ClickUp
                        custom fields
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="platform-field">Platform Veld</Label>
                        <Input
                          id="platform-field"
                          value={newMappingForm.platform_field}
                          onChange={e =>
                            setNewMappingForm(prev => ({
                              ...prev,
                              platform_field: e.target.value,
                            }))
                          }
                          placeholder="bijv. content_type, target_audience"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clickup-field">ClickUp Field</Label>
                        <Select
                          value={newMappingForm.clickup_field_id}
                          onValueChange={value =>
                            setNewMappingForm(prev => ({
                              ...prev,
                              clickup_field_id: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer ClickUp veld" />
                          </SelectTrigger>
                          <SelectContent>
                            {fields.map(field => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.name} ({field.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sync-direction">Sync Richting</Label>
                        <Select
                          value={newMappingForm.sync_direction}
                          onValueChange={(value: any) =>
                            setNewMappingForm(prev => ({
                              ...prev,
                              sync_direction: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="to_clickup">
                              Naar ClickUp
                            </SelectItem>
                            <SelectItem value="from_clickup">
                              Van ClickUp
                            </SelectItem>
                            <SelectItem value="bidirectional">
                              Bidirectioneel
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transform-rule">
                          Transform Regel (optioneel)
                        </Label>
                        <Select
                          value={newMappingForm.transform_rule}
                          onValueChange={value =>
                            setNewMappingForm(prev => ({
                              ...prev,
                              transform_rule: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer transform regel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Geen transform</SelectItem>
                            <SelectItem value="uppercase">Uppercase</SelectItem>
                            <SelectItem value="lowercase">Lowercase</SelectItem>
                            <SelectItem value="array_to_string">
                              Array naar String
                            </SelectItem>
                            <SelectItem value="string_to_array">
                              String naar Array
                            </SelectItem>
                            <SelectItem value="date_to_timestamp">
                              Datum naar Timestamp
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="validation-rule">
                          Validatie Regel (optioneel)
                        </Label>
                        <Select
                          value={newMappingForm.validation_rule}
                          onValueChange={value =>
                            setNewMappingForm(prev => ({
                              ...prev,
                              validation_rule: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer validatie regel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Geen validatie</SelectItem>
                            <SelectItem value="required">Verplicht</SelectItem>
                            <SelectItem value="email">Email formaat</SelectItem>
                            <SelectItem value="url">URL formaat</SelectItem>
                            <SelectItem value="number">Numeriek</SelectItem>
                            <SelectItem value="positive_number">
                              Positief getal
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <NormalButton
                          variant="outline"
                          onClick={() => setNewMappingDialog(false)}
                        >
                          Annuleren
                        </NormalButton>
                        <NormalButton
                          onClick={createMapping}
                          disabled={
                            !newMappingForm.platform_field ||
                            !newMappingForm.clickup_field_id ||
                            isLoading
                          }
                        >
                          {isLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Mapping Maken
                            </>
                          )}
                        </NormalButton>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              {mappings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Geen metadata mappings gevonden
                </div>
              ) : (
                <div className="space-y-4">
                  {mappings.map(mapping => (
                    <div
                      key={mapping.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <Map className="h-5 w-5 text-green-500" />
                        <div>
                          <h3 className="font-medium">
                            {mapping.platform_field} →{" "}
                            {mapping.clickup_field_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Sync: {mapping.mapping_config.sync_direction} |
                            Type: {mapping.field_type}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {mapping.mapping_config.transform_rule && (
                          <Badge variant="secondary">
                            Transform: {mapping.mapping_config.transform_rule}
                          </Badge>
                        )}
                        {mapping.mapping_config.validation_rule && (
                          <Badge variant="outline">
                            Validatie: {mapping.mapping_config.validation_rule}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            mapping.is_active ? "default" : "destructive"
                          }
                        >
                          {mapping.is_active ? "Actief" : "Inactief"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          {fieldStats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Totaal Velden
                        </p>
                        <p className="text-2xl font-bold">
                          {fieldStats.total_fields}
                        </p>
                      </div>
                      <Database className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Verplichte Velden
                        </p>
                        <p className="text-2xl font-bold">
                          {fieldStats.required_fields}
                        </p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Optionele Velden
                        </p>
                        <p className="text-2xl font-bold">
                          {fieldStats.optional_fields}
                        </p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Veld Types
                        </p>
                        <p className="text-2xl font-bold">
                          {Object.keys(fieldStats.field_types).length}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Veld Type Verdeling</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(fieldStats.field_types).map(
                      ([type, count]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{type}</Badge>
                            <span className="text-sm text-gray-600">
                              {count} velden
                            </span>
                          </div>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(count / fieldStats.total_fields) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Veld Gebruik Statistieken</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fieldStats.fields.map(field => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <h4 className="font-medium">{field.name}</h4>
                          <p className="text-sm text-gray-600">
                            Type: {field.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {field.usage_percentage.toFixed(1)}%
                          </p>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${field.usage_percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  {selectedListId
                    ? "Geen statistieken beschikbaar"
                    : "Selecteer een List ID om statistieken te bekijken"}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="management" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bulk Acties
                </CardTitle>
                <CardDescription>
                  Uitgevoerd bulk operaties op velden en mappings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <NormalButton
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Field Mappings
                </NormalButton>
                <NormalButton
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Field Configuration
                </NormalButton>
                <NormalButton
                  className="w-full justify-start"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Bulk Sync Metadata
                </NormalButton>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Onderhoud
                </CardTitle>
                <CardDescription>
                  Systeem onderhoud en cleanup operaties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <NormalButton
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cleanup Field History
                </NormalButton>
                <NormalButton
                  className="w-full justify-start"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Validate Mappings
                </NormalButton>
                <NormalButton
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Reports
                </NormalButton>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
