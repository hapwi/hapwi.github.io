function golf() {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet12");
    var range = spreadsheet.getRange('A2');
    range.clearContent();
    SpreadsheetApp.flush();
    range.setFormula('=IMPORTXML("https://www.espn.com/golf/leaderboard","//td[@class=\'tl plyr Table__TD\']")');
};

{
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet12");
    var range = spreadsheet.getRange('C2');
    range.clearContent();
    SpreadsheetApp.flush();
    range.setFormula('=IMPORTXML("https://www.espn.com/golf/leaderboard","//td[@class=\'Table__TD\'][2]")');
};

// {
//    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet12");
//   var range = spreadsheet.getRange('D2');
//   range.clearContent();
//   SpreadsheetApp.flush();
// range.setFormula('=IMPORTXML("https://www.espn.com/golf/leaderboard","//td[@class=\'Table__TD\'][4]")');};


{
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet12");
    var range = spreadsheet.getRange('D2');
    range.clearContent();
    SpreadsheetApp.flush();
    range.setFormula('=IMPORTXML("https://www.espn.com/golf/leaderboard","//td[@class=\'Table__TD\'][5]")');
};

{
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet12");
    var range = spreadsheet.getRange('E2');
    range.clearContent();
    SpreadsheetApp.flush();
    range.setFormula('=IMPORTXML("https://www.espn.com/golf/leaderboard","//td[@class=\'Table__TD\'][6]")');
};

{
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet12");
    var range = spreadsheet.getRange('F2');
    range.clearContent();
    SpreadsheetApp.flush();
    range.setFormula('=IMPORTXML("https://www.espn.com/golf/leaderboard","//td[@class=\'Table__TD\'][7]")');
};

{
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet12");
    var range = spreadsheet.getRange('G2');
    range.clearContent();
    SpreadsheetApp.flush();
    range.setFormula('=IMPORTXML("https://www.espn.com/golf/leaderboard","//td[@class=\'Table__TD\'][8]")');
};

{
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet12");
    var range = spreadsheet.getRange('H2');
    range.clearContent();
    SpreadsheetApp.flush();
    range.setFormula('=IMPORTXML("https://www.espn.com/golf/leaderboard","//td[@class=\'Table__TD\'][9]")');
};



// new function

function updateGolfLeaderboard() {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet12");
    var columns = ['A', 'C', 'D', 'E', 'F', 'G', 'H'];
    var xpaths = [
        "//td[@class='tl plyr Table__TD']", // For player names
        "//td[@class='Table__TD'][2]", // Original xpath from your script
        "//td[@class='Table__TD'][5]", // Updated to start from the 5th column as per the original
        "//td[@class='Table__TD'][6]",
        "//td[@class='Table__TD'][7]",
        "//td[@class='Table__TD'][8]",
        "//td[@class='Table__TD'][9]"
    ];

    // Clear existing data in one go from 'A2' to 'H2'
    spreadsheet.getRange('A2:H2').clearContent();
    SpreadsheetApp.flush(); // Ensure changes are applied before setting new data

    // Apply new formulas
    columns.forEach((column, index) => {
        var range = spreadsheet.getRange(column + '2');
        range.setFormula('=IMPORTXML("https://www.espn.com/golf/leaderboard", "' + xpaths[index] + '")');
    });

}