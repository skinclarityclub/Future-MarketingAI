"use client";

/**
 * Tenant Branding Customization Component
 * Task 36.4: UI for customizing tenant branding
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NormalButton from "@/components/ui/normal-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Upload,
  Palette,
  Type,
  Layout,
  Settings,
  Save,
  RefreshCw,
  Eye,
  Download,
  Trash2,
  Plus,
  Check,
} from "lucide-react";
import { useTenantBranding } from "@/components/providers/tenant-branding-provider";
import {
  TenantBrandingConfig,
  ThemePreset,
} from "@/lib/branding/tenant-branding-service";

interface BrandingCustomizationProps {
  tenantId: string;
  onSave?: (config: TenantBrandingConfig) => void;
  onPreview?: (config: TenantBrandingConfig) => void;
}

export function BrandingCustomization({
  tenantId,
  onSave,
  onPreview,
}: BrandingCustomizationProps) {
  const {
    branding,
    isLoading,
    error,
    updateBranding,
    applyThemePreset,
    refreshBranding,
  } = useTenantBranding();

  const [localConfig, setLocalConfig] = useState<TenantBrandingConfig | null>(
    null
  );
  const [themePresets, setThemePresets] = useState<ThemePreset[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");
  const [previewMode, setPreviewMode] = useState(false);

  // Initialize local config when branding loads
  useEffect(() => {
    if (branding) {
      setLocalConfig({ ...branding });
    }
  }, [branding]);

  // Load theme presets
  useEffect(() => {
    loadThemePresets();
  }, [tenantId]);

  const loadThemePresets = async () => {
    try {
      const response = await fetch(
        `/api/admin/branding?tenant_id=${tenantId}&action=themes`
      );
      const data = await response.json();
      if (data.success) {
        setThemePresets(data.data);
      }
    } catch (error) {
      console.error("Failed to load theme presets:", error);
    }
  };

  const handleConfigChange = (field: string, value: any) => {
    if (!localConfig) return;

    setLocalConfig(prev => ({
      ...prev!,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!localConfig) return;

    try {
      setIsSaving(true);
      await updateBranding(localConfig);
      onSave?.(localConfig);
    } catch (error) {
      console.error("Failed to save branding:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (!localConfig) return;
    setPreviewMode(!previewMode);
    onPreview?.(localConfig);
  };

  const handleApplyPreset = async (presetId: string) => {
    try {
      await applyThemePreset(presetId);
      await refreshBranding();
    } catch (error) {
      console.error("Failed to apply theme preset:", error);
    }
  };

  const ColorPicker = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center space-x-2">
        <Input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-12 h-10 rounded border-none p-0"
        />
        <Input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const FileUpload = ({
    label,
    accept,
    onUpload,
  }: {
    label: string;
    accept: string;
    onUpload: (file: File) => void;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-2">
          <input
            type="file"
            accept={accept}
            onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])}
            className="hidden"
            id={`upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
          />
          <label
            htmlFor={`upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
            className="cursor-pointer text-blue-600 hover:text-blue-500"
          >
            Click to upload {label.toLowerCase()}
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {accept.includes("image")
            ? "PNG, JPG, SVG up to 10MB"
            : "Various formats supported"}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading branding configuration...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          Error loading branding configuration: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!localConfig) {
    return (
      <Alert>
        <AlertDescription>
          No branding configuration found. Click "Create Default" to get
          started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Branding Customization
          </h2>
          <p className="text-muted-foreground">
            Customize your tenant's brand appearance and styling
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <NormalButton variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Exit Preview" : "Preview"}
          </NormalButton>
          <NormalButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </NormalButton>
        </div>
      </div>

      {/* Theme Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Theme Presets
          </CardTitle>
          <CardDescription>
            Quick start with pre-designed themes or create your own
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {themePresets.map(preset => (
              <div
                key={preset.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => preset.id && handleApplyPreset(preset.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{preset.preset_name}</h4>
                  <Badge variant="secondary">{preset.preset_category}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {preset.preset_description}
                </p>
                <div className="flex space-x-1">
                  {preset.theme_config?.primary_color && (
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{
                        backgroundColor: preset.theme_config.primary_color,
                      }}
                    />
                  )}
                  {preset.theme_config?.secondary_color && (
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{
                        backgroundColor: preset.theme_config.secondary_color,
                      }}
                    />
                  )}
                  {preset.theme_config?.accent_color && (
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{
                        backgroundColor: preset.theme_config.accent_color,
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>
                Define your brand's color palette and theme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorPicker
                  label="Primary Color"
                  value={localConfig.primary_color}
                  onChange={value => handleConfigChange("primary_color", value)}
                />
                <ColorPicker
                  label="Secondary Color"
                  value={localConfig.secondary_color}
                  onChange={value =>
                    handleConfigChange("secondary_color", value)
                  }
                />
                <ColorPicker
                  label="Accent Color"
                  value={localConfig.accent_color}
                  onChange={value => handleConfigChange("accent_color", value)}
                />
                <ColorPicker
                  label="Background Color"
                  value={localConfig.background_color}
                  onChange={value =>
                    handleConfigChange("background_color", value)
                  }
                />
                <ColorPicker
                  label="Text Color"
                  value={localConfig.text_color}
                  onChange={value => handleConfigChange("text_color", value)}
                />
                <ColorPicker
                  label="Email Header Color"
                  value={localConfig.email_header_color}
                  onChange={value =>
                    handleConfigChange("email_header_color", value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Type className="h-5 w-5 mr-2" />
                Typography Settings
              </CardTitle>
              <CardDescription>
                Configure fonts and text styling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Font</Label>
                  <Select
                    value={localConfig.primary_font}
                    onValueChange={value =>
                      handleConfigChange("primary_font", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Secondary Font</Label>
                  <Select
                    value={localConfig.secondary_font}
                    onValueChange={value =>
                      handleConfigChange("secondary_font", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Size Scale: {localConfig.font_size_scale}x</Label>
                <Slider
                  value={[localConfig.font_size_scale]}
                  onValueChange={([value]) =>
                    handleConfigChange("font_size_scale", value)
                  }
                  min={0.8}
                  max={1.5}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Brand Assets
              </CardTitle>
              <CardDescription>
                Upload logos, images, and other brand assets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label="Light Logo"
                  accept="image/*"
                  onUpload={file => {
                    // Handle file upload logic here
                    console.log("Upload light logo:", file);
                  }}
                />
                <FileUpload
                  label="Dark Logo"
                  accept="image/*"
                  onUpload={file => {
                    console.log("Upload dark logo:", file);
                  }}
                />
                <FileUpload
                  label="Icon/Favicon"
                  accept="image/*"
                  onUpload={file => {
                    console.log("Upload icon:", file);
                  }}
                />
                <FileUpload
                  label="Hero Image"
                  accept="image/*"
                  onUpload={file => {
                    console.log("Upload hero image:", file);
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Company Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={localConfig.company_name || ""}
                      onChange={e =>
                        handleConfigChange("company_name", e.target.value)
                      }
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Website</Label>
                    <Input
                      value={localConfig.company_website || ""}
                      onChange={e =>
                        handleConfigChange("company_website", e.target.value)
                      }
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Company Tagline</Label>
                  <Input
                    value={localConfig.company_tagline || ""}
                    onChange={e =>
                      handleConfigChange("company_tagline", e.target.value)
                    }
                    placeholder="Your company's tagline or slogan"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Description</Label>
                  <Textarea
                    value={localConfig.company_description || ""}
                    onChange={e =>
                      handleConfigChange("company_description", e.target.value)
                    }
                    placeholder="Brief description of your company"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layout className="h-5 w-5 mr-2" />
                Layout & Appearance
              </CardTitle>
              <CardDescription>
                Configure the overall layout and visual style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sidebar Style</Label>
                  <Select
                    value={localConfig.sidebar_style}
                    onValueChange={value =>
                      handleConfigChange("sidebar_style", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Header Style</Label>
                  <Select
                    value={localConfig.header_style}
                    onValueChange={value =>
                      handleConfigChange("header_style", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="floating">Floating</SelectItem>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="transparent">Transparent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <Select
                    value={localConfig.border_radius}
                    onValueChange={value =>
                      handleConfigChange("border_radius", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Shadow Intensity</Label>
                  <Select
                    value={localConfig.shadow_intensity}
                    onValueChange={value =>
                      handleConfigChange("shadow_intensity", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Theme</Label>
                  <Select
                    value={localConfig.default_theme}
                    onValueChange={value =>
                      handleConfigChange("default_theme", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Display Options</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Animations</Label>
                      <p className="text-sm text-gray-500">
                        Smooth transitions and animations
                      </p>
                    </div>
                    <Switch
                      checked={localConfig.enable_animations}
                      onCheckedChange={checked =>
                        handleConfigChange("enable_animations", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-gray-500">
                        Denser layout with less spacing
                      </p>
                    </div>
                    <Switch
                      checked={localConfig.compact_mode}
                      onCheckedChange={checked =>
                        handleConfigChange("compact_mode", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Brand Watermark</Label>
                      <p className="text-sm text-gray-500">
                        Display subtle brand watermark
                      </p>
                    </div>
                    <Switch
                      checked={localConfig.show_brand_watermark}
                      onCheckedChange={checked =>
                        handleConfigChange("show_brand_watermark", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                White-label options and custom code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">White Label Options</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>White Label Mode</Label>
                      <p className="text-sm text-gray-500">
                        Remove all references to Marketing Machine
                      </p>
                    </div>
                    <Switch
                      checked={localConfig.is_white_label}
                      onCheckedChange={checked =>
                        handleConfigChange("is_white_label", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Hide "Powered By"</Label>
                      <p className="text-sm text-gray-500">
                        Remove footer attribution
                      </p>
                    </div>
                    <Switch
                      checked={localConfig.hide_powered_by}
                      onCheckedChange={checked =>
                        handleConfigChange("hide_powered_by", checked)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Custom Domain</Label>
                  <Input
                    value={localConfig.custom_domain || ""}
                    onChange={e =>
                      handleConfigChange("custom_domain", e.target.value)
                    }
                    placeholder="dashboard.yourcompany.com"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Custom Code</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Custom CSS</Label>
                    <Textarea
                      value={localConfig.custom_css || ""}
                      onChange={e =>
                        handleConfigChange("custom_css", e.target.value)
                      }
                      placeholder="/* Your custom CSS styles */"
                      rows={6}
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Custom JavaScript</Label>
                    <Textarea
                      value={localConfig.custom_javascript || ""}
                      onChange={e =>
                        handleConfigChange("custom_javascript", e.target.value)
                      }
                      placeholder="// Your custom JavaScript code"
                      rows={4}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Email Branding</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Footer Text</Label>
                    <Input
                      value={localConfig.email_footer_text}
                      onChange={e =>
                        handleConfigChange("email_footer_text", e.target.value)
                      }
                      placeholder="Powered by Marketing Machine"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Signature</Label>
                    <Textarea
                      value={localConfig.email_signature || ""}
                      onChange={e =>
                        handleConfigChange("email_signature", e.target.value)
                      }
                      placeholder="Your email signature"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
