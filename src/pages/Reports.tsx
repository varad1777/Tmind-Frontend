import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import {jsPDF} from "jspdf";
import autoTable from "jspdf-autotable";
// Dummy signal report data generator
const generateReportData = (date: string) => [
  { device: "D1", asset: "A2", signal: "Temperature", value: "45°C", timestamp: date + " 09:00" },
  { device: "D1", asset: "A2", signal: "Voltage", value: "220V", timestamp: date + " 09:05" },
  { device: "D2", asset: "A1", signal: "Temperature", value: "40°C", timestamp: date + " 10:00" },
  { device: "D2", asset: "A1", signal: "Voltage", value: "230V", timestamp: date + " 10:05" },
];

// CSV download helper
const downloadCSV = (data: any[], filename = "signal-report.csv") => {
  if (!data || data.length === 0) {
    toast.error("No data to download!");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];
  csvRows.push(headers.join(","));
  data.forEach((row) => {
    const values = headers.map((h) => `"${row[h] ?? ""}"`);
    csvRows.push(values.join(","));
  });

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// PDF download helper
const downloadPDF = (data: any[], filename = "signal-report.pdf") => {
  if (!data || data.length === 0) {
    toast.error("No data to download!");
    return;
  }

  const doc = new jsPDF();
  doc.text("Daily Signal Report", 14, 16);

  const headers = [Object.keys(data[0])];
  const rows = data.map((row) => Object.values(row));

  // Use autoTable as a function
  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 20,
  });

  doc.save(filename);
};

export default function DailySignalReport() {
  const [selectedDate, setSelectedDate] = useState("");
  const [reportData, setReportData] = useState<any[]>([]);

  const handleGenerateReport = () => {
    if (!selectedDate) {
      toast.error("Please select a date!");
      return;
    }
    setReportData(generateReportData(selectedDate));
    toast.success("Report generated!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-card/5 border border-border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-foreground">Daily Signal Report</h2>

      {/* Date Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-border rounded-md bg-background text-foreground"
        />
        <Button onClick={handleGenerateReport} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Generate Report
        </Button>
      </div>

      {/* Download Buttons */}
      {reportData.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-2">
          <Button
            onClick={() => downloadCSV(reportData)}
            className="bg-primary/20 text-primary border border-primary hover:bg-primary/30"
          >
            Download CSV
          </Button>
          <Button
            onClick={() => downloadPDF(reportData)}
            className="bg-primary/20 text-primary border border-primary hover:bg-primary/30"
          >
            Download PDF
          </Button>
        </div>
      )}

      {/* Table Preview */}
      {reportData.length > 0 && (
        <div className="overflow-x-auto mt-4 border border-border rounded-lg shadow-sm">
          <table className="w-full border-collapse text-foreground">
            <thead className="bg-primary/10 text-primary-foreground">
              <tr>
                {Object.keys(reportData[0]).map((key) => (
                  <th key={key} className="p-3 border-b border-border text-left font-semibold">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, i) => (
                <tr key={i} className="hover:bg-primary/5 transition-colors">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="p-2 border-b border-border">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
