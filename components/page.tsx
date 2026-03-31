"use client";
import React, { useState } from 'react'
import ActivityBar from '../components/activitybar/page';
import Content from '../components/content/page';
import Toolbar from './toolbar/page';

type PageProps = {
  user: {
    sub: string;
    email: string;
    username: string;
  } | null;
};

export default function Page({ user }: PageProps) {
  const [activeTab, setActiveTab] = useState<'workspace' | 'toolbox' | 'workbox'>('workspace');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar user={user} />
      <div className='flex flex-1'>
        <ActivityBar
          activeTab={activeTab}
          onTabSelect={setActiveTab}
          isTerminalOpen={isTerminalOpen}
          onTerminalToggle={() => setIsTerminalOpen((open) => !open)}
        />
        <Content />
      </div>
    </div>
  )
}
