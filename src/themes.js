const themes = {
  dark: {
    background: "bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]", // Gradient from dark gray to slightly lighter gray
    cardBackground: "bg-[#27272a]", // Dark gray background
    cardBorder: "border-[#3f3f3f]", // header and bottom nav and table color
    text: "text-[#f5f5f5]", // Very light gray text
    headerBackground: "bg-[#333333]", // Medium gray background for header
    headerText: "text-[#b3b3b3]", // Light gray text for header
    expandedBackground: "bg-[#333333]", // Same medium gray background for expanded sections
    scoreText: "text-[#10b981]", // Emerald green text for scores
    cellBackground: "bg-[#f7fafc]", // Light gray background for cells
    cellText: "text-[#e5e7eb]", // Light gray text for cells
    golferBackground: "bg-[#27272a]", // Red background for golfers
    golferText: "text-[#2e2e2e]", // Darker gray text for golfers
  },
  light: {
    background: "bg-gradient-to-br from-gray-100 to-gray-200",
    cardBackground: "bg-white",
    cardBorder: "border-gray-200",
    text: "text-gray-800",
    headerBackground: "bg-gray-100",
    headerText: "text-gray-600",
    expandedBackground: "bg-gray-50",
    scoreText: "text-green-600",
    cellBackground: "bg-gray-100",
    cellText: "text-gray-800",
    evenRowBackground: "bg-gray-100",
    oddRowBackground: "bg-gray-200",
  },
};

export default themes;
