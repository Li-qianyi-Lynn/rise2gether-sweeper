import { AlertCircle, CheckCircle, Download, Upload } from 'lucide-react';
import Papa from 'papaparse';
import React, { useState } from 'react';
import MergedTableDownloader from './MergedTableDownloader';
import './SquarespaceSweeper.css';
const SquarespaceSweeper = () => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const categorizeParticipant = (discountCode, price) => {
    // 根据discount code分类
    if (discountCode) {
      const code = discountCode.toUpperCase().trim();
      if (code.startsWith('VOL')) return 'volunteer';
      if (code.startsWith('SPE')) return 'speaker';
      if (code.startsWith('GUE')) return 'guest';
    }
    // 根据价格分类
    const numPrice = parseFloat(price) || 0;
    if (numPrice >= 100) {
      return 'general'; // 大型活动
    } else if (numPrice >= 20) {
      return 'general'; // Career panel等中型活动
    }
    return 'general'; // 默认分类
  };
  const processCSV = (csvData) => {
    const categories = {
      general: [],
      volunteer: [],
      guest: [],
      speaker: []
    };
    csvData.forEach(row => {
      // 提取需要的信息
      const name = row['Billing Name'] || '';
      const email = row['Email'] || '';
      const orderId = String(row['Order ID'] || ''); // 确保 Order ID 作为字符串存储
      const quantity = parseInt(row['Lineitem quantity'] || '0', 10) || 0;
      const discountCode = row['Discount Code'] || '';
      const price = row['Lineitem price'] || '';
      const lineitemName = row['Lineitem name'] || '';
      const financialStatus = (row['Financial Status'] || '').toLowerCase().trim();

      // 检查是否是退款
      const isRefunded = financialStatus === 'refund' || financialStatus === 'refunded';

      // 分类
      const category = categorizeParticipant(discountCode, price);
      const eventType = lineitemName; // 直接使用 Lineitem name 作为 Event Type
      
      // 如果数量 >= 2，拆分成多行
      const ticketCount = quantity >= 2 ? quantity : 1;
      for (let i = 1; i <= ticketCount; i++) {
        const cleanRecord = {
          Name: name,
          Email: email,
          'Order ID': orderId,
          'Ticket Quantity': quantity >= 2 ? `1 (${i}/${quantity})` : quantity,
          'Ticket Number': quantity >= 2 ? i : '',
          'Discount Code': discountCode,
          'Event Type': eventType,
          Price: price,
          'Financial Status': financialStatus || 'paid',
          'Is Refunded': isRefunded
        };
        categories[category].push(cleanRecord);
      }
    });
    return categories;
  };
  const handleFile = (uploadedFile) => {
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      setFile(uploadedFile);
      setError(null);
    } else {
      setError('Please upload a valid CSV file');
    }
  };
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    handleFile(uploadedFile);
  };
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    handleFile(droppedFile);
  };
  const handleProcess = () => {
    if (!file) {
      setError('Please upload a file first');
      return;
    }
    setProcessing(true);
    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const categories = processCSV(results.data);
          setResult(categories);
          setProcessing(false);
        } catch (err) {
          setError('Error processing file: ' + err.message);
          setProcessing(false);
        }
      },
      error: (err) => {
        setError('Error parsing CSV: ' + err.message);
        setProcessing(false);
      }
    });
  };
 
  // Financial Status keep empty, only refunded record show "REFUNDED" to highlight
  const cleanRecordsForCSV = (data) => {
    return data.map(record => {
      const { 'Is Refunded': isRefunded, 'Discount Code': __, ...cleanRecord } = record;
      return {
        ...cleanRecord,
        'Financial Status': isRefunded ? 'REFUNDED' : ''
      };
    });
  };

  const downloadCSV = (data, filename) => {
   
    const cleanedData = cleanRecordsForCSV(data);
    const csv = Papa.unparse(cleanedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const downloadAll = () => {
    if (!result) return;
    Object.keys(result).forEach(category => {
      if (result[category].length > 0) {
        downloadCSV(result[category], `${category}_attendees.csv`);
      }
    });
  };
  return (
    <div className="container">
      <div className="wrapper">
        <div className="card">
          <h1 className="title">
            Squarespace Data Sweeper
          </h1>
          <p className="description">
            Upload your Squarespace CSV to categorize attendees and remove sensitive information
          </p>
          {/* Upload Section */}
          <div className="uploadSection">
            <label 
              className={`uploadLabel ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="uploadContent">
                <Upload className="uploadIcon" />
                <p className="uploadText">
                  <span className="uploadTextBold">Click to upload</span> or drag and drop
                </p>
                <p className="uploadSubtext">CSV file from Squarespace</p>
              </div>
              <input
                type="file"
                className="fileInput"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </label>
            {file && (
              <p className="fileName">
                <CheckCircle className="fileIcon" />
                {file.name}
              </p>
            )}
          </div>
          {/* Error Message */}
          {error && (
            <div className="errorMessage">
              <AlertCircle className="errorIcon" />
              <p className="errorText">{error}</p>
            </div>
          )}
          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={!file || processing}
            className="processButton"
          >
            {processing ? 'Processing...' : 'Process CSV'}
          </button>
          {/* Results */}
          {result && (
            <div className="results">
              <h2 className="resultsTitle">Results</h2>
              {/* Refund Warning */}
              {(() => {
                const allData = Object.values(result).flat();
                const refundedCount = allData.filter(record => record['Is Refunded']).length;
                return refundedCount > 0 && (
                  <div className="refundWarning">
                    <AlertCircle className="errorIcon" />
                    <p className="refundWarningText">
                      ⚠️ Found {refundedCount} refunded records!
                    </p>
                  </div>
                );
              })()}
              <div className="statsGrid">
                {Object.entries(result).map(([category, data]) => {
                  const refundedInCategory = data.filter(record => record['Is Refunded']).length;
                  return (
                    <div key={category} className="statCard">
                      <h3 className="statTitle">
                        {category}
                      </h3>
                      <p className="statNumber">
                        {data.length}
                      </p>
                      <p className="statLabel">attendees</p>
                      {refundedInCategory > 0 && (
                        <p className="refundedLabel">
                          {refundedInCategory} refunded
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Data Preview Table - Only Refunded Records */}
              {(() => {
                const allData = Object.values(result).flat();
                const refundedRecords = allData.filter(record => record['Is Refunded']);
                const refundedCount = refundedRecords.length;
                return refundedCount > 0 && (
                  <div className="tableContainer">
                    <h3 className="tableTitle">
                      {refundedCount} refunded (highlighted)
                    </h3>
                    <div className="tableWrapper">
                      <table className="previewTable">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Order ID</th>
                            <th>Financial Status</th>
                            <th>Price</th>
                            <th>Event Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {refundedRecords.map((record, index) => (
                            <tr 
                              key={index} 
                              className="refundedRow"
                            >
                              <td>{record.Name}</td>
                              <td>{record.Email}</td>
                              <td>{String(record['Order ID'] || '')}</td>
                              <td>
                                <span className="refundedStatus">
                                  {record['Financial Status']}
                                </span>
                              </td>
                              <td>{record.Price}</td>
                              <td>{record['Event Type']}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
              {/* Download Buttons */}
              <div className="downloadSection">
                <button
                  onClick={downloadAll}
                  className="downloadAllButton"
                >
                  <Download className="downloadIcon" />
                  Download All Files
                </button>
                <MergedTableDownloader result={result} downloadCSV={downloadCSV} />
                <div className="downloadGrid">
                  {Object.entries(result).map(([category, data]) => (
                    data.length > 0 && (
                      <button
                        key={category}
                        onClick={() => downloadCSV(data, `${category}_attendees.csv`)}
                        className="downloadButton"
                      >
                        Download {category}
                      </button>
                    )
                  ))}
                </div>
              </div>
              {/* Info Box */}
              <div className="infoBox">
                <h3 className="infoTitle">Classification Rules:</h3>
                <ul className="infoList">
                  <li>• <strong>Volunteer:</strong> Discount code starts with "VOL"</li>
                  <li>• <strong>Speaker:</strong> Discount code starts with "SPE"</li>
                  <li>• <strong>Guest:</strong> Discount code starts with "GUE"</li>
                  <li>• <strong>General:</strong> All others</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SquarespaceSweeper;
