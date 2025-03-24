
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSonarr } from '@/hooks/useSonarr';
import { AlertCircle, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SonarrConfig: React.FC = () => {
  const { config, isConnected, isLoading, saveConfig } = useSonarr();
  const [url, setUrl] = useState(config.url);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveConfig({ url, apiKey, connected: false });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card">
      <CardHeader>
        <CardTitle className="text-2xl">Sonarr Configuration</CardTitle>
        <CardDescription>
          Connect your Sonarr instance to automatically add selected anime
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {isConnected && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Successfully connected to Sonarr
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="sonarr-url">Sonarr URL</Label>
            <Input
              id="sonarr-url"
              type="url"
              placeholder="http://localhost:8989"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="glass"
            />
            <p className="text-xs text-muted-foreground">
              The base URL of your Sonarr instance, e.g. http://localhost:8989
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="Your Sonarr API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="glass pr-32"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? "Hide" : "Show"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Find your API key in Sonarr under Settings &gt; General &gt; Security
            </p>
          </div>
          
          <Alert variant="default" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-600 dark:text-amber-400">
              Make sure your Sonarr instance is accessible from this device
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading || (!url || !apiKey)} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : isConnected ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Update Connection
              </>
            ) : (
              "Connect to Sonarr"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SonarrConfig;
