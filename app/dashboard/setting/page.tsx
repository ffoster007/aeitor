import React from 'react';
import Toolbar from '@/components/toolbar/page';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { AccountSettings } from '@/components/settings/AccountSettings';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  const oauthCount = user
    ? await prisma.oAuthAccount.count({ where: { userId: user.sub } })
    : 0;

  const isOAuth = oauthCount > 0;

  return (
    <div className="h-screen flex flex-col">
      <Toolbar user={user} />
      <main className="flex-1 overflow-y-auto bg-[#1a1a1a] text-white">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 lg:px-6">
          {user ? (
            <AccountSettings
              username={user.username}
              email={user.email}
              userId={user.sub}
              isOAuth={isOAuth}
            />
          ) : (
            <p className="text-sm text-[#8e887f]">Please sign in to view your settings.</p>
          )}
        </div>
      </main>
    </div>
  );
}
