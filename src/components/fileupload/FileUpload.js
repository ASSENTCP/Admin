import React, { useState } from "react";
import { db } from "../../utils/next.config";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button, CircularProgress } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        alert("Please select a file.");
        return;
      }

      setUploading(true);
      setProgress(0);

      // Read the uploaded CSV file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split("\n").map((row) => row.split(","));

        const totalRows = rows.length;
        let uploadedCount = 0;

        // Extract data from CSV and upload to Firestore
        for (const row of rows) {
          // Ensure the row has valid data
          if (
            row.length < 3 ||
            !row[0].trim() ||
            !row[1].trim() ||
            !row[2].trim()
          ) {
            break; // Stop processing when an empty row is encountered
          }

          const [employeeId, name, trade] = row;

          const UserId = uuidv4();
          const docRef = doc(db, "Users", UserId);
          const userData = {
            userid: UserId,
            name: name.trim(),
            employeeId: employeeId.trim(),
            trade: trade.trim(),
            timestamp: serverTimestamp(),
          };

          await setDoc(docRef, userData, { merge: true });

          uploadedCount++;
          const uploadProgress = (uploadedCount / totalRows) * 100;
          setProgress(uploadProgress);
        }

        setUploading(false);
        setProgress(100);
        alert("CSV data added to Firestore successfully.");
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error uploading CSV data to Firestore:", error);
      setUploading(false);
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <input type="file" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={uploading}>
        Upload
      </Button>
      {uploading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CircularProgress variant="determinate" value={progress} />
          <p>{Math.round(progress)}% uploaded</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
