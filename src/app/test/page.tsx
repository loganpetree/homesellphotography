'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('Loading...');
  const [hdResult, setHdResult] = useState<string>('Loading...');

  useEffect(() => {
    // Test our basic API endpoint
    fetch('/api/test')
      .then(res => res.json())
      .then(data => setTestResult(JSON.stringify(data, null, 2)))
      .catch(err => setTestResult('Error: ' + err.message));

    // Test HDPhotoHub API endpoint
    fetch('/api/hdphotohub/sites')
      .then(res => res.text()) // Get raw text first
      .then(text => {
        setHdResult(`Status: ${text}`);
        return text;
      })
      .then(text => {
        try {
          const data = JSON.parse(text);
          setHdResult(JSON.stringify(data, null, 2));
        } catch (e) {
          // If it's not JSON, we'll keep the raw text
        }
      })
      .catch(err => setHdResult('Error: ' + err.message));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Test API Response:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {testResult}
        </pre>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">HDPhotoHub API Response:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {hdResult}
        </pre>
      </div>
    </div>
  );
}

