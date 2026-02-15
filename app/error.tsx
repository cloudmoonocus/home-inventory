'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[v0] Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <h1 className="text-xl font-semibold">出错了</h1>
          </div>
          
          <p className="text-sm text-muted-foreground">
            应用遇到了一个问题。请尝试刷新页面或重新开始。
          </p>
          
          {error.message && (
            <div className="rounded-md bg-secondary p-3">
              <p className="text-xs font-mono text-muted-foreground">
                {error.message}
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={reset}
              className="flex-1 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              重试
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.location.href = '/'}
            >
              返回首页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
