'use client';
import React from 'react';

export type DeviceStatus = 'ON' | 'OFF' | '...';
export type Command = 'ON' | 'OFF';

interface DeviceCardProps {
  name: string;
  status: DeviceStatus;
  onOn: () => void;
  onOff: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ name, status, onOn, onOff }) => {
  const isOnline = status === 'ON' || status === 'OFF';
  const isOn = status === 'ON';

  return (
    <div className={`p-6 rounded-lg shadow-lg transition-all border ${isOn ? 'bg-yellow-500/90 text-black border-yellow-300' : 'bg-gray-800/70 border-gray-700'} `}>
      <h2 className="text-xl font-bold mb-2 tracking-tight">{name}</h2>
      <p className="text-sm mb-4">
        Status:
        <span className={`font-semibold ml-2 ${isOnline ? '' : 'text-gray-400'}`}>
          {isOnline ? status : 'Connecting...'}
        </span>
      </p>
      <div className="flex space-x-3">
        <button
          onClick={onOn}
          disabled={!isOnline}
          className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 rounded-md font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
        >
          ON
        </button>
        <button
          onClick={onOff}
          disabled={!isOnline}
          className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 rounded-md font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
        >
          OFF
        </button>
      </div>
    </div>
  );
};

export default DeviceCard;
