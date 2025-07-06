import { I18nDemo } from "@/components/i18n-demo";

export default function I18nTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Internationalization Demo
          </h1>
          <p className="text-lg text-gray-600">
            Modern Next.js 15 App Router i18n implementation
          </p>
        </div>

        <I18nDemo />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Switch languages using the globe icon above. Preferences are saved
            in localStorage.
          </p>
        </div>
      </div>
    </div>
  );
}
