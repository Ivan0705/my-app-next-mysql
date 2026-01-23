"use client";
import { useState } from "react";

const APITest = () => {
  const [testResult, setTestResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint: string) => {
    setLoading(true);
    setTestResult("");

    try {
      const response = await fetch(`/api/sql/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: "CREATE TABLE test (id INT, name VARCHAR(100));",
          dialect: "mysql",
          from_dialect: "mysql",
          to_dialect: "postgres",
        }),
      });

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🔧 API Connection Test</h3>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => testAPI("analyze")}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Test /analyze
        </button>

        <button
          onClick={() => testAPI("transpile")}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          Test /transpile
        </button>
      </div>

      {loading && <div>Testing API connection...</div>}

      {testResult && (
        <div>
          <h4 className="font-semibold mb-2">API Response:</h4>
          <pre className="bg-white p-4 rounded border text-sm overflow-auto">
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
};

export default APITest;
