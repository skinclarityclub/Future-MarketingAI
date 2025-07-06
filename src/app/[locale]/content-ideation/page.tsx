import { getDictionary } from "@/i18n/dictionaries";

export default async function ContentIdeationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {dict.contentIdeation?.title || "Content Ideation"}
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-lg text-gray-600 mb-4">
            {dict.contentIdeation?.description ||
              "AI-powered content ideation engine for strategic content planning."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                {dict.contentIdeation?.features?.aiGeneration ||
                  "AI Generation"}
              </h3>
              <p className="text-sm text-blue-700">
                {dict.contentIdeation?.features?.aiGenerationDesc ||
                  "Generate content ideas using advanced AI algorithms"}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                {dict.contentIdeation?.features?.trendAnalysis ||
                  "Trend Analysis"}
              </h3>
              <p className="text-sm text-green-700">
                {dict.contentIdeation?.features?.trendAnalysisDesc ||
                  "Analyze current trends for strategic content planning"}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">
                {dict.contentIdeation?.features?.competitorGaps ||
                  "Competitor Analysis"}
              </h3>
              <p className="text-sm text-purple-700">
                {dict.contentIdeation?.features?.competitorGapsDesc ||
                  "Gain insights from competitor content strategies"}
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">System Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
