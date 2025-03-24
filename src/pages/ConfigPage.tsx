
import React, { useState } from 'react';
import Header from '@/components/Header';
import SonarrConfig from '@/components/SonarrConfig';
import AutoRules from '@/components/AutoRules';
import MalConfig from '@/components/MalConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sonarr');

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="container px-4 py-6 mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your connections and auto-selection rules
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="sonarr">Sonarr Connection</TabsTrigger>
            <TabsTrigger value="mal">MyAnimeList API</TabsTrigger>
            <TabsTrigger value="rules">Auto-Selection Rules</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sonarr" className="mt-0">
            <SonarrConfig />
          </TabsContent>
          
          <TabsContent value="mal" className="mt-0">
            <MalConfig />
          </TabsContent>
          
          <TabsContent value="rules" className="mt-0">
            <AutoRules />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ConfigPage;
