import React, { useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function UploadAssetCsv() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (!droppedFile.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file only!");
      return;
    }

    setFile(droppedFile);
    toast.info(`Selected: ${droppedFile.name}`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file only!");
      return;
    }

    setFile(selectedFile);
    toast.info(`Selected: ${selectedFile.name}`);
  };

  const handleSubmit = () => {
    if (!file) {
      toast.warning("Please select a CSV file first!");
      return;
    }

    toast.success(`✅ CSV file "${file.name}" submitted successfully!`);

    setFile(null);
    navigate("/assets");
  };

  const handleCancel = () => {
    navigate("/assets");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <h1 className="text-2xl font-semibold mb-4">Upload CSV</h1>

      {/* Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`w-full max-w-md h-48 border-2 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/10" : "border-border bg-card"
        }`}
      >
        {file ? (
          <p className="text-center font-medium">{file.name}</p>
        ) : (
          <p className="text-center text-muted-foreground">
            Drag & drop a CSV file here or click to select
          </p>
        )}

        {/* File input — only covering upload box */}
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="absolute opacity-0 inset-x-0 h-48 cursor-pointer"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-5 w-full max-w-md">
        <Button
          variant="outline"
          className="w-1/2"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <Button
          className="w-1/2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSubmit}
        >
          Submit CSV
        </Button>
      </div>
    </div>
  );
}
