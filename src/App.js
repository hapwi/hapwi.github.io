import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GolfPoolLeaderboard from "./GolfPoolLeaderboard";
import Players from "./Players";
import Form from "./Form";
import BottomNav from "./BottomNav";
import Header from "./Header";
import AddToHomeScreenPrompt from "./AddToHomeScreenPrompt";
import ScrollToTop from "./ScrollToTop";
import { ThemeProvider, ThemeContext } from "./themeContext";
import "./App.css"; // Import the CSS file here

// Create a client
const queryClient = new QueryClient();

function AppContent() {
  const theme = useContext(ThemeContext);

  return (
    <Router>
      <div
        className={`App min-h-screen flex flex-col ${theme.background} ${theme.text} hide-scrollbar`}
      >
        <Header />
        <ScrollToTop />
        <main className="flex-grow pt-28 pb-20 px-4 hide-scrollbar">
          <div className="max-w-2xl mx-auto">
            <Routes>
              <Route path="/" element={<GolfPoolLeaderboard />} />
              <Route path="/players" element={<Players />} />
              <Route path="/form" element={<Form />} />
            </Routes>
          </div>
        </main>
        <BottomNav />
        <AddToHomeScreenPrompt />
      </div>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
