"use client";
import type { ToolbarProps } from './toolbar/page';
import ActivityBar from '../components/activitybar/page';
import Toolbar from './toolbar/page';

type PageProps = ToolbarProps;

export default function Page({ user }: PageProps) {
  return (
    <div className="h-screen flex flex-col">
      <Toolbar user={user} />
      <div className='flex flex-1'>
        <ActivityBar />
      </div>
    </div>
  );
}
