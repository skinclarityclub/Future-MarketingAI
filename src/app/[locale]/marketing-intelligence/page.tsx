import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketing Intelligence | SKC BI Dashboard",
  description: "Advanced marketing intelligence and analytics dashboard",
};

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function MarketingIntelligencePage({ params }: Props) {
  await params;

  return (
    <div className="dark min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          Marketing Intelligence
        </h1>
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-300">
            Marketing Intelligence dashboard coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
