import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { AuthRequest } from '../../../types/api';

interface AuthRequestCardProps {
  request: AuthRequest;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export function AuthRequestCard({ request, onApprove, onReject }: AuthRequestCardProps) {
  const [showRejectInput, setShowRejectInput] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');

  const statusVariant = request.status === 'APPROVED' ? 'success' 
    : request.status === 'REJECTED' ? 'destructive' 
    : 'warning';

  const handleReject = () => {
    if (showRejectInput && rejectReason.trim()) {
      onReject(request.id, rejectReason);
      setShowRejectInput(false);
      setRejectReason('');
    } else {
      setShowRejectInput(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{request.agentBotName}</CardTitle>
            <CardDescription>Requested by {request.applicant.email}</CardDescription>
          </div>
          <Badge variant={statusVariant}>{request.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Purpose</p>
          <p className="text-sm text-[#6b6375]">{request.agentBotPurpose}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Reason</p>
          <p className="text-sm text-[#6b6375]">{request.reason}</p>
        </div>
        {request.rejectReason && (
          <div>
            <p className="text-sm font-medium">Rejection Reason</p>
            <p className="text-sm text-red-500">{request.rejectReason}</p>
          </div>
        )}
        {request.status === 'PENDING' && (
          <div className="flex gap-2 pt-2">
            <Button onClick={() => onApprove(request.id)}>Approve</Button>
            {showRejectInput ? (
              <div className="flex flex-1 gap-2">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="flex-1 h-10 px-3 rounded-lg border border-[#e5e4e7]"
                />
                <Button variant="destructive" onClick={handleReject}>
                  Confirm Reject
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={handleReject}>
                Reject
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
