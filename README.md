# Media.net Dashboard

A web application to fetch and display reports from Media.net API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Start the server:
```bash
node server.js
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Login with your Media.net credentials
2. Select date range for reports
3. Click "Fetch Reports" to view data

## Features

- Secure authentication with Media.net API
- Hourly channel-wise reports
- Responsive data table
- Date range selection
- Pagination support