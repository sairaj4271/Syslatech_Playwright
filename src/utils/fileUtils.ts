// ============================================================================
// FILE UTILS - ENTERPRISE VERSION
// ----------------------------------------------------------------------------
// PURPOSE:
//   Unified utility library for reading/writing files inside automation:
//     ✔ CSV
//     ✔ Excel (.xlsx)
//     ✔ JSON
//     ✔ Text files
//     ✔ Latest downloaded file
//     ✔ File existence checks
//
// WHEN TO USE:
//   - Reading exported test data
//   - Reading workflow configuration files
//   - Parsing latest downloaded Excel from Bluecopa portal
//   - Writing custom log files / reports
//
// NOTE:
//   This is a non-UI utility. No Playwright imports here.
//   Safe to use in backend helpers (API tests / data-driven tests).
// ============================================================================

import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import * as fse from "fs-extra";

export class FileUtils {

  // ============================================================================
  // 🔍 CHECK FILE EXISTS
  // ----------------------------------------------------------------------------
  /**
   * Returns TRUE if a given file exists.
   *
   * WHEN TO USE:
   * - Before reading a CSV/Excel/JSON file
   * - Validation before downloads
   *
   * @example
   * FileUtils.fileExists("downloads/data.csv");
   */
  static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  // ============================================================================
  // 📥 READ CSV FILE
  // ----------------------------------------------------------------------------
  /**
   * Reads CSV file and returns an array of objects.
   *
   * HOW IT WORKS:
   * - Uses csv-parse/sync
   * - Returns rows as JSON objects
   *
   * WHEN TO USE:
   * - Exported reports
   * - Data-driven tests
   *
   * @example
   * const rows = FileUtils.readCSV("downloads/report.csv");
   * console.log(rows[0].email);
   */
  static readCSV(filePath: string): any[] {
    if (!this.fileExists(filePath))
      throw new Error(`CSV file not found → ${filePath}`);

    const content = fs.readFileSync(filePath, "utf-8");

    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  }

  // ============================================================================
  // 📥 READ EXCEL (.xlsx)
  // ----------------------------------------------------------------------------
  /**
   * Reads Excel file (.xlsx) and returns sheet data as JSON.
   *
   * HOW IT WORKS:
   * - Automatically loads the first sheet unless sheetName is provided
   * - Converts all rows → array of JSON objects
   *
   * WHEN TO USE:
   * - Bluecopa “Download XLSX” flows
   * - Reading pricing/bid-tape data
   * - Excel-based data-driven tests
   *
   * @example
   * const excelData = FileUtils.readExcel("downloads/file.xlsx");
   * console.log(excelData[0].Status);
   */
  static readExcel(filePath: string, sheetName?: string): any[] {
    if (!this.fileExists(filePath))
      throw new Error(`Excel file not found → ${filePath}`);

    const workbook = XLSX.readFile(filePath);

    const sheet = sheetName || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheet];

    return XLSX.utils.sheet_to_json(worksheet, { defval: "" });
  }

  // ============================================================================
  // 📥 READ JSON
  // ----------------------------------------------------------------------------
  /**
   * Reads a JSON file and returns parsed object.
   *
   * WHEN TO USE:
   * - Test data JSON
   * - API payload templates
   * - Environment config files
   *
   * @example
   * const creds = FileUtils.readJSON("data/login.json");
   */
  static readJSON(filePath: string): any {
    if (!this.fileExists(filePath))
      throw new Error(`JSON file not found → ${filePath}`);

    return fse.readJSONSync(filePath);
  }

  // ============================================================================
  // 📥 READ TEXT FILE
  // ----------------------------------------------------------------------------
  /**
   * Reads a .txt file and returns string content.
   *
   * WHEN TO USE:
   * - Logs
   * - Simple exported plain text files
   */
  static readText(filePath: string): string {
    if (!this.fileExists(filePath))
      throw new Error(`Text file not found → ${filePath}`);

    return fs.readFileSync(filePath, "utf-8");
  }

  // ============================================================================
  // 📝 WRITE CSV
  // ----------------------------------------------------------------------------
  /**
   * Writes an array of JSON objects into CSV format.
   *
   * WHEN TO USE:
   * - Generating local reports
   * - Exporting execution results
   *
   * @example
   * FileUtils.writeCSV("output/results.csv", [
   *   { name: "Sai", status: "Pass" },
   *   { name: "Raj", status: "Fail" }
   * ]);
   */
  static writeCSV(filePath: string, data: any[]): void {
    const header = Object.keys(data[0]).join(",") + "\n";
    const rows = data.map(row => Object.values(row).join(",")).join("\n");

    fs.writeFileSync(filePath, header + rows);
  }

  // ============================================================================
  // 📝 WRITE EXCEL (.xlsx)
  // ----------------------------------------------------------------------------
  /**
   * Writes JSON array into a .xlsx Excel file.
   *
   * WHEN TO USE:
   * - Creating Excel results for test reporting
   * - Generating test input files dynamically
   */
  static writeExcel(filePath: string, data: any[], sheetName = "Sheet1"): void {
    const dir = path.dirname(filePath);

    // Auto create folder
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filePath);
}


  // ============================================================================
  // 📝 WRITE TEXT
  // ----------------------------------------------------------------------------
  /**
   * Writes a string into a text file.
   *
   * WHEN TO USE:
   * - Writing logs
   * - Temporary text data
   */
  static writeText(filePath: string, content: string): void {
    fs.writeFileSync(filePath, content, "utf-8");
  }

  // ============================================================================
  // 📂 GET LATEST FILE IN A FOLDER
  // ----------------------------------------------------------------------------
  /**
   * Returns the latest modified file in a directory.
   *
   * HOW IT WORKS:
   * - Reads all files in folder
   * - Sorts by modified time
   * - Returns newest file
   *
   * WHEN TO USE:
   * - Handling downloads folder
   * - Bluecopa exports (“Latest Excel”)
   * - Selecting newest ZIP/CSV reports
   *
   * @example
   * const newest = FileUtils.getLatestFile("downloads/");
   * const excelData = FileUtils.readExcel(newest);
   */
  static getLatestFile(directoryPath: string): string {
    const files = fs.readdirSync(directoryPath);

    if (files.length === 0) throw new Error("No files found in directory.");

    const sorted = files
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(directoryPath, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    return path.join(directoryPath, sorted[0].name);
  }
  // ============================================================================
// 🆕 AUTO-GENERATE EXCEL FILE (Uses test name + timestamp)
// ============================================================================
static writeExcelAuto(testInfo: any, data: any[], folder = "test-results/excel") {
    // 1. Extract test name
    const testName = testInfo.title.replace(/\s+/g, "_");

    // 2. Timestamp for uniqueness
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // 3. Final filename
    const fileName = `Excel_${testName}_${timestamp}.xlsx`;

    // 4. Ensure folder exists
    const dir = path.join(process.cwd(), folder);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // 5. Full file path
    const fullPath = path.join(dir, fileName);

    // 6. Write Excel (reuses your existing writeExcel)
    this.writeExcel(fullPath, data);

    // 7. Logging
    console.log(`📁 Excel saved automatically → ${fullPath}`);

    return fullPath;
}

}
