import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GolfPoolLeaderboard from "./GolfPoolLeaderboard";
import Players from "./Players";
import Form from "./Form";
import BottomNav from "./BottomNav";
import Header from "./Header";
import AddToHomeScreenPrompt from "./AddToHomeScreenPrompt";
import ScrollToTop from "./ScrollToTop";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css"; // Import the SimpleBar CSS
import "./App.css"; // Import your custom CSS

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <SimpleBar style={{ maxHeight: "100vh" }}>
          <div className="App min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 flex flex-col">
            <Header />
            <main className="flex-grow pt-28 pb-20 px-4">
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
        </SimpleBar>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
