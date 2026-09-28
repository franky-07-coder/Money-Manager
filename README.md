# Money Manager

Money Manager is a lightweight personal finance dashboard for tracking income and expenses. Transactions are saved in your browser, so your data stays on the device and browser where you entered it.

## Features

- View your total balance, income, and expenses.
- Review monthly income, expenses, net savings, and savings rate.
- Browse transactions by month and filter by income or expense.
- Search transaction descriptions and categories.
- Add, edit, and delete transactions with a description, amount, type, category, and date.
- Import and export transaction data as CSV for backups or moving data.
- View an income and expense chart for the selected month.

## Requirements

- Node.js and npm

## Run locally

Install the dependencies and start the development server:

```bash
npm install
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000).

Create a production build with:

```bash
npm run build
```

## CSV import and export

Export downloads a CSV containing all transactions. To import a CSV, include these column headers:

| Column | Required | Description |
| --- | --- | --- |
| `description` | Yes | Transaction name or note |
| `amount` | Yes | Positive numeric amount |
| `type` | Yes | `income` or `expense` |
| `category` | No | Transaction category; defaults to `Other` |
| `date` | No | Transaction date; missing or invalid dates use the import date |

Import validates the file before adding its transactions. It adds imported entries to the existing list; it does not replace existing data.

## Data and privacy

Transactions are stored in the browser's `localStorage`. Clearing site data or using a different browser or device will not carry those transactions over. Export a CSV backup before clearing browser data.

## Technology

- React 18 with Create React App
- Chakra UI
- ApexCharts
