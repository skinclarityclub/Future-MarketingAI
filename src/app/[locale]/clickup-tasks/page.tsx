import React from "react";
import ClickUpTasksClient from "./client";

interface ClickUpTasksPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ClickUpTasksPage({
  params,
}: ClickUpTasksPageProps) {
  const { locale } = await params;

  return <ClickUpTasksClient locale={locale} />;
}
