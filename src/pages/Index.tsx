
import React from 'react';
import Header from '@/components/Header';
import SeasonBrowser from '@/components/SeasonBrowser';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="container px-4 py-6 mx-auto">
        <SeasonBrowser />
      </main>
    </div>
  );
};

export default Index;
