import { Download } from 'lucide-react';
import React from 'react';
import './SquarespaceSweeper.css';

const MergedTableDownloader = ({ result, downloadCSV }) => {
  const downloadMerged = () => {
    if (!result) return;

    // 注意：downloadCSV 会保留所有记录（包括refunded）
    const mergedData = [];

    Object.keys(result).forEach(category => {
      result[category].forEach(record => {
        mergedData.push({
          ...record,
          Category: category.charAt(0).toUpperCase() + category.slice(1)
        });
      });
    });

    if (mergedData.length > 0) {
      downloadCSV(mergedData, 'all_attendees_merged.csv');
    }
  };

  return (
    <button
      onClick={downloadMerged}
      className="mergedDownloadButton"
    >
      <Download className="downloadIcon" />
      Download Merged Table 
    </button>
  );
};

export default MergedTableDownloader;

