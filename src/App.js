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

// Create a client
const queryClient = new QueryClient();

// Add CSS directly in JavaScript
const styles = `
/* Hide scrollbar for Chrome, Safari, and Opera */
::-webkit-scrollbar {
    display: none;
}

/* Hide scrollbar for IE, Edge, and Firefox */
body {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

/* Ensure scrolling is still possible */
body {
    overflow: -moz-scrollbars-none;
    overflow-y: scroll;  /* Ensure vertical scrolling is enabled */
    -webkit-overflow-scrolling: touch;  /* Smooth scrolling on iOS */
}

/* Additional styling for your app */
.App {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #1f2937; /* Match your app's background color */
    font-family: Arial, sans-serif;
}
`;

// Inject styles into the document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
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
      </Router>
    </QueryClientProvider>
  );
}

export default App;
