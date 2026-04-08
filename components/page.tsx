"use client";
import React, { useState } from 'react'
import ActivityBar from '../components/activitybar/page';
import Toolbar from './toolbar/page';

type User = {
  sub: string;
  email: string;
  username: string;
};

type PageProps = {
  user: User | null;
  children?: React.ReactNode;
};

export default function Page({ user, children }: PageProps) {
  return (
    <div className="h-screen flex flex-col">
      <Toolbar user={user} />
      <div className='flex flex-1'>
        <ActivityBar />
      </div>
    </div>
  );
}
