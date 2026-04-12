import React from 'react';
import { useAuthRequestStore } from '../../../store/auth-request-store';
import { AuthRequestCard } from './auth-request-card';

interface AuthRequestListProps {
  filterStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export function AuthRequestList({ filterStatus }: AuthRequestListProps) {
  const { requests, isLoading, approveRequest, rejectRequest, fetchRequests } = useAuthRequestStore();

  React.useEffect(() => {
    fetchRequests(filterStatus);
  }, [filterStatus, fetchRequests]);

  const handleApprove = async (id: string) => {
    try {
      await approveRequest(id);
    } catch {
      // Error handled in store
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await rejectRequest(id, reason);
    } catch {
      // Error handled in store
    }
  };

  if (isLoading && requests.length === 0) {
    return <p className="text-center text-[#6b6375]">Loading requests...</p>;
  }

  if (requests.length === 0) {
    return <p className="text-center text-[#6b6375]">No requests found</p>;
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <AuthRequestCard
          key={request.id}
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </div>
  );
}
