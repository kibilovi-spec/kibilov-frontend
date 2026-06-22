import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation — Kibilov Auto Parts',
  description: 'kibilov.ge Public API — ავტონაწილების მონაცემთა ბაზა',
};

const endpoints = [
  { method: 'GET', path: '/api/products', desc: 'პროდუქტების სია', params: 'q, page, limit, category, brand, featured' },
  { method: 'GET', path: '/api/products/:id', desc: 'პროდუქტი ID ან SKU-ით', params: 'id or sku' },
  { method: 'GET', path: '/api/categories', desc: 'კატეგორიების სია', params: 'lang' },
  { method: 'GET', path: '/api/parts/search', desc: 'ნაწილების ძებნა', params: 'q, make, model, year' },
  { method: 'POST', path: '/api/vin/decode', desc: 'VIN კოდის გაშიფვრა', params: 'body: { vin }' },
  { method: 'GET', path: '/api/garages', desc: 'სერვის ცენტრები', params: 'city' },
  { method: 'GET', path: '/api/reviews/:productId', desc: 'პროდუქტის შეფასებები', params: 'productId' },
];

const colors: Record<string,string> = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  PATCH: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔌 kibilov.ge Public API</h1>
          <p className="text-gray-500 mb-4">ავტონაწილების მონაცემთა ბაზა — მესამე მხარის ინტეგრაციისთვის</p>
          <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm">
            <p className="text-gray-500">Base URL:</p>
            <p className="text-blue-600 font-bold">https://kibilov.ge/api</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔑 Authentication</h2>
          <p className="text-gray-600 text-sm mb-3">Public endpoints არ საჭიროებს auth. Protected endpoints-ისთვის:</p>
          <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm">
            <p className="text-gray-500">Header:</p>
            <p className="text-blue-600">Authorization: Bearer YOUR_TOKEN</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6">📋 Endpoints</h2>
          <div className="space-y-4">
            {endpoints.map((ep, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${colors[ep.method]}`}>{ep.method}</span>
                  <code className="text-sm font-mono text-gray-800">{ep.path}</code>
                </div>
                <p className="text-sm text-gray-600 mb-1">{ep.desc}</p>
                <p className="text-xs text-gray-400">Params: {ep.params}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
