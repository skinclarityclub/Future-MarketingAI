import React from "react";
import SocialMediaConfiguration from "@/components/admin/social-media-configuration";

export default function CommandCenterSocialMediaPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Command Center - Social Media
          </h1>
          <p className="text-gray-400 text-lg">
            Configure and manage all your social media API integrations in one
            place
          </p>
        </div>

        <SocialMediaConfiguration />
      </div>
    </div>
  );
}
