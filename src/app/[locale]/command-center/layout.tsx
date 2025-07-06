import { ReactNode } from "react";

interface CommandCenterLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function CommandCenterLayout({
  children,
  params,
}: CommandCenterLayoutProps) {
  const { locale } = await params;

  return <div className="dark min-h-screen">{children}</div>;
}
