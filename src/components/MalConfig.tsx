
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { getMalConfig, saveMalConfig } from '@/lib/api';

const MalConfig: React.FC = () => {
  const [config, setConfig] = useState({ clientId: '', connected: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Load saved configuration
    const savedConfig = getMalConfig();
    setConfig(savedConfig);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await saveMalConfig(config);
      if (success) {
        setConfig(prev => ({ ...prev, connected: true }));
        toast.success('Successfully connected to MyAnimeList API');
      }
    } catch (error) {
      console.error('Error connecting to MAL:', error);
      toast.error('Failed to connect to MyAnimeList API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card">
      <CardHeader>
        <CardTitle className="text-2xl">MyAnimeList API</CardTitle>
        <CardDescription>
          Connect to MyAnimeList to get more accurate anime data
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {config.connected && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Successfully connected to MyAnimeList API
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="mal-client-id">Client ID</Label>
            <div className="relative">
              <Input
                id="mal-client-id"
                type={showKey ? "text" : "password"}
                placeholder="Your MyAnimeList Client ID"
                value={config.clientId}
                onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
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
              You can get a Client ID by creating an app on <a href="https://myanimelist.net/apiconfig" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center">MyAnimeList <ExternalLink className="h-3 w-3 ml-1" /></a>
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading || !config.clientId} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : config.connected ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Update Connection
              </>
            ) : (
              "Connect to MyAnimeList"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default MalConfig;
