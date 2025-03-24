
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, PlayCircle, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname === '/' ? '/browse' : location.pathname;

  return (
    <header className="glass sticky top-0 w-full z-50 border-b py-3 animate-fade-in">
      <div className="container flex justify-between items-center px-4 md:px-6">
        <h1 
          className="text-xl font-semibold tracking-tight cursor-pointer flex items-center"
          onClick={() => navigate('/')}
        >
          <PlayCircle className="w-6 h-6 mr-2" />
          AnimeSyncMaster
        </h1>
        
        <Tabs value={currentPath} className="hidden md:flex">
          <TabsList className="bg-transparent">
            <TabsTrigger 
              value="/browse"
              onClick={() => navigate('/')}
              className="data-[state=active]:glass"
            >
              Browse
            </TabsTrigger>
            <TabsTrigger 
              value="/selected"
              onClick={() => navigate('/selected')}
              className="data-[state=active]:glass"
            >
              Selected
              <CheckCircle className="ml-1 h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger 
              value="/config"
              onClick={() => navigate('/config')}
              className="data-[state=active]:glass"
            >
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/config')}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
