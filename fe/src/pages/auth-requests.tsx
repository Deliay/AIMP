import { useState } from 'react';
import { AuthRequestList } from '../components/features/auth-request/auth-request-list';
import { Button } from '../components/ui/button';
import { Sidebar } from '../components/ui/sidebar';
import type { SubaccountStatus } from '../types/api';

export function AuthRequestsPage() {
  const [filterStatus, setFilterStatus] = useState<SubaccountStatus | undefined>(undefined);

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Authorization Requests</h1>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === undefined ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(undefined)}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('PENDING')}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'APPROVED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('APPROVED')}
              >
                Approved
              </Button>
              <Button
                variant={filterStatus === 'REJECTED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('REJECTED')}
              >
                Rejected
              </Button>
            </div>
          </div>
          <AuthRequestList filterStatus={filterStatus} />
        </div>
      </div>
    </div>
  );
}
