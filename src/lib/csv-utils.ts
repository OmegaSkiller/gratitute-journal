export interface CSVEntry {
  date: string;
  content: string;
}

export function exportToCSV(entries: CSVEntry[]) {
  // 1. Create content
  // Header: date,content
  const header = "date,content\n";
  const rows = entries.map(e => `"${e.date}","${e.content.replace(/"/g, '""')}"`).join("\n");
  const csvContent = header + rows;

  // 2. Create Blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // 3. Trigger Download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `journal_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSV(csvText: string): CSVEntry[] {
  const lines = csvText.split('\n');
  const result: CSVEntry[] = [];
  
  // Simple parser assuming "date","content" format
  // Skip header if present
  const startIndex = lines[0].toLowerCase().startsWith('date,') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Handle quotes: "2023-01-01","Content with ""quotes"" and ,"
      // Regex to match: "(.*?)"|[^,]+
      // But simpler: since we control export, we can assume standard CSV or use a library.
      // Let's implement a basic robust parser.
      
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      // Wait, simple split by comma is risky for content.
      
      // Manual parse state machine is safer for "content, with comma"
      let inQuote = false;
      let buffer = '';
      const cells = [];
      
      for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
             if (j + 1 < line.length && line[j+1] === '"') {
                 // Escaped quote
                 buffer += '"';
                 j++;
             } else {
                 inQuote = !inQuote;
             }
          } else if (char === ',' && !inQuote) {
             cells.push(buffer);
             buffer = '';
          } else {
             buffer += char;
          }
      }
      cells.push(buffer);
      
      if (cells.length >= 2) {
          let date = cells[0].trim().replace(/^"|"$/g, '');
          let content = cells[1].replace(/^"|"$/g, '');
          
          // Basic validation
          if (date.match(/^\d{4}-\d{2}-\d{2}$/) && content) {
              result.push({ date, content });
          }
      }
  }
  return result;
}
