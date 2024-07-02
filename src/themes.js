const themes = {
  fourthJulyDarkTheme: {
    background: "bg-gradient-to-br from-[#0a1c3d] to-[#0f2a4a]",
    cardBackground: "bg-[#162a4a]", // Slightly lighter navy for cards
    cardBorder: "border-[#2a3f62]", // Subtle, slightly lighter border
    text: "text-[#fff]", // Light gray text for readability
    headerBackground: "bg-[#162a4a]", // leaderboard table header - Same as cardBackground for consistency
    headerText: "text-[#9ca3af]", // Light gray for header text
    expandedBackground: "bg-[#162a4a]", // Same as cardBackground
    scoreText: "text-[#ff6b6b]", // Muted red for scores
    cellBackground: "bg-[#2a3f62]", // Same as cardBackground
    golferBackground: "bg-[#2a3f62]", // Same as cardBackground
    golferText: "text-[#ffffff]", // White for golfer names
    headerBg: "bg-[#0a1c3d]", // Same as cardBackground
    headerTextHeader: "bg-gradient-to-r from-[#ff6b6b] to-[#ffcccb]", // Gradient for header text
    headerTextForm: "bg-gradient-to-r from-[#ff6b6b] to-[#ffcccb]", // Gradient for form header text
    formEntry: "bg-[#2a3f62]", // Background for form entries
    formButton: "bg-[#ff6b6b] hover:bg-[#ff4c4c]", // Red for form button with hover effect
    rulesIcon: "text-[#ff6b6b]",
  },

  main: {
    background: "bg-gradient-to-br from-[#111827] to-[#1f2937]",
    cardBackground: "bg-[#1f2937]", // will also be color of body in index.html
    cardBorder: "border-[#374151]", // Subtle, slightly lighter border
    text: "text-[#fff]", // Light gray text for readability
    headerBackground: "bg-[#1f2937]", // leaderboard table header - Same as cardBackground for consistency
    headerText: "text-[#9ca3af]", // White for header text
    expandedBackground: "bg-[#1f2937]", // Same as cardBackground
    scoreText: "text-[#34d399]", // Muted red for scores
    cellBackground: "bg-[#374151]", // Same as cardBackground
    golferBackground: "bg-[#374151]", // Same as cardBackground
    golferText: "text-[#ffffff]", // White for golfer names
    headerBg: "bg-[#111827]", // Same as cardBackground same as theme color in index.html
    headerTextHeader: "bg-gradient-to-r from-[#34d399] to-[#3b82f6]", // White for header text
    headerTextForm: "bg-gradient-to-r from-[#34d399] to-[#3b82f6]",
    formEntry: "bg-[#374151]",
    formButton: "bg-[#10b981] hover:bg-[#059669]",
    rulesIcon: "text-[#34d399]",
  },
};

export default themes;
