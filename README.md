# Squarespace Data Sweeper

A tool for processing and cleaning Squarespace CSV data, automatically categorizing attendees and removing sensitive information.
Deployed by Vercel: https://rise2gether-sweeper.vercel.app/

## Features

- 📤 **File Upload**: Support for both click-to-upload and drag-and-drop CSV files

- 🔄 **Data Categorization**: Automatically categorizes attendees based on discount codes and prices
  - **Volunteer**: Discount code starts with "VOL"
  - **Speaker**: Discount code starts with "SPE"
  - **Guest**: Discount code starts with "GUE"
  - **General**: All other cases

- 🔒 **Data Sanitization**: Automatically removes sensitive information (addresses, credit cards, phone numbers, etc.)

- 📥 **Multiple Download Options**:
  - Download all categorized files
  - Download individual categories
  - Download merged table with all data (includes category column)

## Tech Stack

- **React 19** - UI Framework
- **Vite** - Build Tool
- **PapaParse** - CSV parsing and processing
- **Lucide React** - Icon library
- **CSS** - Custom styles (separate stylesheet)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts the development server, typically at `http://localhost:5173`

## Build

```bash
npm run build
```

Builds the production version, output to the `dist` directory.

## Preview

```bash
npm run preview
```

Preview the production build.

## Project Structure

```
src/
  ├── SquarespaceSweeper.jsx    # Main component
  ├── SquarespaceSweeper.css    # Stylesheet
  ├── MergedTableDownloader.jsx # Merged table component
  └── App.jsx                   # App entry point
```

## Usage

1. Open the application
2. Upload or drag-and-drop a CSV file exported from Squarespace
3. Click "Process CSV" to process the file
4. View categorized results and statistics
5. Choose download options:
   - **Download All Files**: Download CSV files for all categories
   - **Download Merged Table**: Download a single merged table (includes category column)
   - **Download {category}**: Download individual category files

## Categorization Rules

- **Volunteer**: Discount code starts with "VOL"
- **Speaker**: Discount code starts with "SPE"
- **Guest**: Discount code starts with "GUE"
- **General**: All other attendees

## License

MIT
