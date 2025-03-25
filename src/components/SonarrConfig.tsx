
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSonarr } from '@/hooks/useSonarr';
import { AlertCircle, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SonarrConfig: React.FC = () => {
  const { config, isConnected, isLoading, isTesting, saveConfig, testConnection, setRootFolder } = useSonarr();
  const [url, setUrl] = useState(config.url);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [selectedRootFolder, setSelectedRootFolder] = useState(config.defaultRootFolder || '');

  const handleTestConnection = async () => {
    if (url && apiKey) {
      await testConnection(url, apiKey);
    }
  };

  // Handle root folder change
  const handleRootFolderChange = (value: string) => {
    setSelectedRootFolder(value);
    if (value) {
      setRootFolder(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const configToSave = { 
      url, 
      apiKey, 
      connected: false,
      defaultRootFolder: selectedRootFolder,
      // Preserve existing root folders if they exist
      rootFolders: config.rootFolders 
    };
    await saveConfig(configToSave);
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
            <div className="flex gap-2">
              <div className="relative flex-1">
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
              <Button 
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={!url || !apiKey || isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Find your API key in Sonarr under Settings &gt; General &gt; Security
            </p>
          </div>

          {config.rootFolders && config.rootFolders.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="root-folder">Root Folder</Label>
              <Select value={selectedRootFolder} onValueChange={handleRootFolderChange}>
                <SelectTrigger id="root-folder">
                  <SelectValue placeholder="Select a root folder" />
                </SelectTrigger>
                <SelectContent>
                  {config.rootFolders.map((folder) => (
                    <SelectItem 
                      key={folder.id} 
                      value={folder.path}
                    >
                      {folder.path} ({(folder.freeSpace! / (1024 * 1024 * 1024)).toFixed(2)} GB free)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select where you want your anime to be stored
              </p>
            </div>
          )}
          
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
