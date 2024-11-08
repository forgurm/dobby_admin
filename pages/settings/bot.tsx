import React, { useState, useEffect } from 'react';

interface AlertInfo {
  id: number;
  name: string;
  lv: number;
}

export default function BotSettings() {
  const [alertInfos, setAlertInfos] = useState<AlertInfo[]>([]);

  useEffect(() => {
    const fetchAlertInfos = async () => {
      try {
        const response = await fetch('/api/alerts');
        if (!response.ok) throw new Error('Failed to fetch alert infos');
        const data = await response.json();
        setAlertInfos(data);
      } catch (error) {
        console.error('Error fetching alert infos:', error);
      }
    };

    fetchAlertInfos();
  }, []);

  const handleNameChange = (index: number, newName: string) => {
    const updatedInfos = [...alertInfos];
    updatedInfos[index].name = newName;
    setAlertInfos(updatedInfos);
  };

  const handleLvChange = (index: number, newLv: number) => {
    const updatedInfos = [...alertInfos];
    updatedInfos[index].lv = newLv;
    setAlertInfos(updatedInfos);
  };

  const handleSave = async (index: number) => {
    try {
      const info = alertInfos[index];
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([info]),
      });

      if (!response.ok) throw new Error('Failed to save alert info');
      console.log('Alert info updated successfully');
    } catch (error) {
      console.error('Error saving alert info:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">봇 설정</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {alertInfos.map((info, index) => (
            <tr key={info.id}>
              <td className="px-6 py-4 whitespace-nowrap">{info.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  value={info.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  value={info.lv}
                  onChange={(e) => handleLvChange(index, parseInt(e.target.value))}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleSave(index)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  저장
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 