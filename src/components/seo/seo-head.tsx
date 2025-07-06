"use client";

/**
 * SEO Head Component
 * Task 79.11: SEO Optimization - Traditional + LLM SEO
 *
 * Comprehensive SEO component that injects structured data and metadata
 * optimized for both traditional search engines and AI agents
 */

import React from "react";
import Head from "next/head";
import { ComprehensiveSEOData } from "@/lib/seo/seo-optimizer";

interface SEOHeadProps {
  seoData: ComprehensiveSEOData;
  path?: string;
}

export function SEOHead({ seoData, path }: SEOHeadProps) {
  const { traditional, llm } = seoData;
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://future-marketing.ai"
      : "http://localhost:3000";
  const fullUrl = path ? `${baseUrl}${path}` : baseUrl;

  // Generate JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: traditional.title,
    description: traditional.description,
    url: fullUrl,
    inLanguage: "nl-NL",
    isPartOf: {
      "@type": "WebSite",
      name: "Intelligence Hub",
      url: baseUrl,
    },
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "Intelligence Hub",
      description:
        "Enterprise Business Intelligence Dashboard met AI-powered analytics",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "15000",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "15000",
          priceCurrency: "EUR",
          billingDuration: "P1M",
        },
      },
    },
    about: llm.entityMentions.map(entity => ({
      "@type": "Thing",
      name: entity.entity,
      description: entity.context,
    })),
    keywords: traditional.keywords?.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": fullUrl,
    },
  };

  // Organization structured data
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FutureMarketingAI",
    description: "Enterprise Business Intelligence Solutions",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      "https://linkedin.com/company/futuremarketing",
      "https://twitter.com/futuremarketing",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+31-20-123-4567",
      contactType: "sales",
      availableLanguage: ["Dutch", "English"],
    },
  };

  return (
    <Head>
      {/* Traditional SEO Meta Tags */}
      <title>{traditional.title}</title>
      <meta name="description" content={traditional.description} />
      {traditional.keywords && (
        <meta name="keywords" content={traditional.keywords.join(", ")} />
      )}
      <meta name="robots" content={traditional.robots || "index,follow"} />
      <link rel="canonical" href={traditional.canonical || fullUrl} />

      {/* Open Graph */}
      <meta
        property="og:title"
        content={traditional.openGraph?.title || traditional.title}
      />
      <meta
        property="og:description"
        content={traditional.openGraph?.description || traditional.description}
      />
      <meta property="og:url" content={traditional.openGraph?.url || fullUrl} />
      <meta
        property="og:site_name"
        content={traditional.openGraph?.siteName || "FutureMarketingAI"}
      />
      <meta
        property="og:image"
        content={traditional.openGraph?.image || `${baseUrl}/og-default.jpg`}
      />
      <meta
        property="og:type"
        content={traditional.openGraph?.type || "website"}
      />
      <meta
        property="og:locale"
        content={traditional.openGraph?.locale || "nl_NL"}
      />

      {/* Twitter Card */}
      <meta
        name="twitter:card"
        content={traditional.twitter?.card || "summary_large_image"}
      />
      <meta
        name="twitter:title"
        content={traditional.twitter?.title || traditional.title}
      />
      <meta
        name="twitter:description"
        content={traditional.twitter?.description || traditional.description}
      />
      <meta
        name="twitter:image"
        content={traditional.twitter?.image || `${baseUrl}/og-default.jpg`}
      />

      {/* AI/LLM Optimization Meta Tags */}
      <meta name="ai:semantic-context" content={llm.semanticContext} />
      <meta name="ai:content-type" content={llm.contentStructure.contentType} />
      <meta name="ai:complexity" content={llm.contentStructure.complexity} />
      <meta name="ai:primary-intent" content={llm.aiAgentHints.primaryIntent} />
      <meta
        name="ai:entities"
        content={llm.entityMentions.map(e => e.entity).join(",")}
      />
      <meta
        name="ai:key-insights"
        content={llm.aiAgentHints.keyInsights.join(" | ")}
      />
      <meta
        name="ai:answerable-questions"
        content={llm.aiAgentHints.answerableQuestions.join(" | ")}
      />

      {/* Structured Data - JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData),
        }}
      />

      {/* Additional SEO enhancements */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0F172A" />
      <meta name="color-scheme" content="dark" />

      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Language alternatives */}
      <link rel="alternate" hrefLang="nl" href={`${baseUrl}/nl${path || ""}`} />
      <link rel="alternate" hrefLang="en" href={`${baseUrl}/en${path || ""}`} />
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}/nl${path || ""}`}
      />
    </Head>
  );
}

/**
 * Simplified SEO component for basic pages
 */
export function BasicSEO({
  title,
  description,
  path,
  keywords = [],
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
}) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://future-marketing.ai"
      : "http://localhost:3000";
  const fullUrl = path ? `${baseUrl}${path}` : baseUrl;

  return (
    <Head>
      <title>{title} | FutureMarketingAI</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={`${title} | FutureMarketingAI`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="FutureMarketingAI" />
      <meta property="og:image" content={`${baseUrl}/og-default.jpg`} />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | FutureMarketingAI`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${baseUrl}/og-default.jpg`} />
    </Head>
  );
}
