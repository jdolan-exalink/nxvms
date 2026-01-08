import { useState, useEffect } from 'react';
import {
  getDefaultServerUrl,
  setServerUrl,
  clearServerUrl,
  SERVER_CONFIGS,
  checkServerHealth,
} from '../shared/server-config';

export const ServerSettings = () => {
  const [currentUrl, setCurrentUrl] = useState(getDefaultServerUrl());
  const [testResult, setTestResult] = useState<'testing' | 'success' | 'failed' | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const handleSelectPredefined = async (url: string) => {
    setTestResult('testing');
    const isHealthy = await checkServerHealth(url);
    if (isHealthy) {
      setServerUrl(url);
      setCurrentUrl(url);
      setTestResult('success');
      setTimeout(() => setTestResult(null), 2000);
    } else {
      setTestResult('failed');
      setTimeout(() => setTestResult(null), 2000);
    }
  };

  const handleCustomUrl = async () => {
    if (!customUrl) return;
    setTestResult('testing');
    const isHealthy = await checkServerHealth(customUrl);
    if (isHealthy) {
      setServerUrl(customUrl);
      setCurrentUrl(customUrl);
      setShowCustomInput(false);
      setCustomUrl('');
      setTestResult('success');
      setTimeout(() => setTestResult(null), 2000);
    } else {
      setTestResult('failed');
      setTimeout(() => setTestResult(null), 2000);
    }
  };

  const handleReset = () => {
    clearServerUrl();
    setCurrentUrl(getDefaultServerUrl());
    setShowCustomInput(false);
    setCustomUrl('');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Server Configuration</h2>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">Current Server: <strong>{currentUrl}</strong></p>

        {testResult === 'testing' && <p className="text-blue-500">Testing connection...</p>}
        {testResult === 'success' && <p className="text-green-500">✓ Server connected successfully</p>}
        {testResult === 'failed' && <p className="text-red-500">✗ Failed to connect to server</p>}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Predefined Servers</h3>
        <div className="grid grid-cols-1 gap-2">
          {SERVER_CONFIGS.map((config) => (
            <button
              key={config.name}
              onClick={() => handleSelectPredefined(config.url)}
              className={`p-3 text-left rounded border-2 transition ${
                currentUrl === config.url
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold">{config.name}</div>
              <div className="text-sm text-gray-600">{config.description}</div>
              <div className="text-xs text-gray-500 mt-1">{config.url}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Custom Server</h3>
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Add Custom Server
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., http://10.1.1.174:3000/api/v1"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={handleCustomUrl}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Connect
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomUrl('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
};
