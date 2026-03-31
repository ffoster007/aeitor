import React from 'react'
import ComponentsPage from '@/components/page'
import { getCurrentUser } from '@/lib/session'

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return <ComponentsPage user={user} />
}