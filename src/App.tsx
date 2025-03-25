
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimeListProvider } from "@/contexts/AnimeListContext";
import Index from "./pages/Index";
import SelectedAnime from "./pages/SelectedAnime";
import ConfigPage from "./pages/ConfigPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AnimeListProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/selected" element={<SelectedAnime />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AnimeListProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
