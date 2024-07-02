const themes = {
  dark: {
    background: "bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]", // Gradient from dark gray to slightly lighter gray
    cardBackground: "bg-[#27272a]", // Dark gray background
    cardBorder: "border-[#3f3f3f]", // header and bottom nav and table color
    text: "text-[#f5f5f5]", // Very light gray text
    headerBackground: "bg-[#333333]", // Medium gray background for header
    headerText: "text-[#dedcc5]", // Light gray text for header
    expandedBackground: "bg-[#333333]", // Same medium gray background for expanded sections
    scoreText: "text-[#10b981]", // Emerald green text for scores
    cellBackground: "bg-[#f7fafc]", // Light gray background for cells
    cellText: "text-[#e5e7eb]", // Light gray text for cells
    golferBackground: "bg-[#27272a]", // Red background for golfers
    golferText: "text-[#2e2e2e]", // Darker gray text for golfers
  },

  fourthJulyDarkTheme: {
    background: "bg-gradient-to-br from-[#0a1c3d] to-[#0f2a4a]",
    // Gradient from dark navy blue to slightly lighter navy
    cardBackground: "bg-[#162a4a]", // Slightly lighter navy for cards
    cardBorder: "border-[#2a3f62]", // Subtle, slightly lighter border
    text: "text-[#d8d8d8]", // Light gray text for readability
    headerBackground: "bg-[#162a4a]", // leaderboard table header - Same as cardBackground for consistency
    headerText: "text-[#ffffff]", // White for header text
    expandedBackground: "bg-[#162a4a]", // Same as cardBackground
    scoreText: "text-[#ff6b6b]", // Muted red for scores
    cellBackground: "bg-[#2a3f62]", // Same as cardBackground
    cellText: "text-[#d8d8d8]", // Same as main text
    golferBackground: "bg-[#2a3f62]", // Same as cardBackground
    golferText: "text-[#ffffff]", // White for golfer names
    accentColor: "text-[#4ca6ff]", // Muted light blue for accents
    headerBg: "bg-[#0a1c3d]", // Same as cardBackground
  },
};

export default themes;
