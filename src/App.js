import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GolfPoolLeaderboard from "./GolfPoolLeaderboard";
import Players from "./Players";
import Form from "./Form";
import BottomNav from "./BottomNav";
import Header from "./Header";

function App() {
  return (
    <Router basename="/golf-pool-leaderboard">
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
      </div>
    </Router>
  );
}

export default App;
