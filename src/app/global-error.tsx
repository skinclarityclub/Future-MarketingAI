"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-auto px-4 text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Application Error
              </h2>
              <p className="text-gray-600 mb-6">
                A critical error occurred. Please try refreshing the page.
              </p>
              <div className="space-y-3">
                <button
                  onClick={reset}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Try again
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
              {error.message && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500">
                    Error details
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-32">
                    {error.message}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
