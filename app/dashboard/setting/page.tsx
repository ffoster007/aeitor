import React from 'react';
import Toolbar from '@/components/toolbar/page';
import { getCurrentUser } from '@/lib/session';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="h-screen flex flex-col">
      <Toolbar user={user} />
      <div className="flex-1 p-4">
        <h1 className="text-xl font-semibold text-white mb-4">Settings</h1>
        <p className="text-gray-300">ปรับแต่งการตั้งค่าของคุณที่นี่</p>
      </div>
    </div>
  );
}
