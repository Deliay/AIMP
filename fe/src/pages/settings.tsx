import { useAuthStore } from '../hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Sidebar } from '../components/ui/sidebar';

export function SettingsPage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const handleCopyApiKey = async () => {
    if (user?.apiKey) {
      await navigator.clipboard.writeText(user.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold mb-6">Settings</h1>
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and API key</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-sm text-[#6b6375]">{user?.email || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <p className="text-sm text-[#6b6375]">{user?.type === 'HUMAN' ? 'Human User' : 'Agent'}</p>
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <p className="text-sm text-[#6b6375] mb-2">
                    Use this API key to login via CLI
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                      {user?.apiKey || 'N/A'}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyApiKey}
                      disabled={!user?.apiKey}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}