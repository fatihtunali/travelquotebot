import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// Google Sheets configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

// Initialize auth client
function getAuthClient() {
  // Try to read from file first
  const credentialsPath = path.join(process.cwd(), 'google-credentials.json');

  let credentials;

  if (fs.existsSync(credentialsPath)) {
    try {
      const fileContent = fs.readFileSync(credentialsPath, 'utf8');
      credentials = JSON.parse(fileContent);
    } catch (error) {
      throw new Error('Failed to read google-credentials.json: ' + error);
    }
  } else {
    // Fall back to environment variable
    const envCredentials = process.env.GOOGLE_SHEETS_CREDENTIALS;

    if (!envCredentials) {
      throw new Error('Google credentials not found. Please create google-credentials.json or set GOOGLE_SHEETS_CREDENTIALS');
    }

    try {
      credentials = JSON.parse(envCredentials);
    } catch (error) {
      throw new Error('Failed to parse GOOGLE_SHEETS_CREDENTIALS: ' + error);
    }
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  return auth;
}

// Fetch data from Google Sheet
export async function fetchSheetData(
  spreadsheetId: string,
  range: string = 'Sheet1!A:G'
): Promise<any[][]> {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response.data.values || [];
}

// Fetch Google Ads data from sheet and parse it
export async function fetchGoogleAdsData() {
  const spreadsheetId = process.env.GOOGLE_ADS_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error('GOOGLE_ADS_SHEET_ID environment variable is not set');
  }

  const rows = await fetchSheetData(spreadsheetId);

  if (rows.length === 0) {
    return {
      headers: [],
      data: [],
      summary: null
    };
  }

  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((header: string, index: number) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });

  // Calculate summary metrics
  const summary = calculateSummary(data);

  return {
    headers,
    data,
    summary
  };
}

// Calculate summary metrics from the data
function calculateSummary(data: any[]) {
  if (data.length === 0) return null;

  const totalClicks = data.reduce((sum, row) => sum + (parseFloat(row['Clicks']) || 0), 0);
  const totalImpressions = data.reduce((sum, row) => sum + (parseFloat(row['Impressions']) || 0), 0);
  const totalCost = data.reduce((sum, row) => sum + (parseFloat(row['Cost']?.replace(/[^0-9.-]+/g, '')) || 0), 0);
  const totalConversions = data.reduce((sum, row) => sum + (parseFloat(row['Conversions']) || 0), 0);
  const totalConvValue = data.reduce((sum, row) => sum + (parseFloat(row['Conv. Value']?.replace(/[^0-9.-]+/g, '')) || 0), 0);

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
  const cpc = totalClicks > 0 ? (totalCost / totalClicks) : 0;
  const convRate = totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0;
  const costPerConv = totalConversions > 0 ? (totalCost / totalConversions) : 0;
  const roas = totalCost > 0 ? (totalConvValue / totalCost) : 0;

  // Get unique campaigns
  const campaigns = [...new Set(data.map(row => row['Campaign']))];

  // Daily breakdown for charts
  const dailyData = data.reduce((acc: any, row) => {
    const date = row['Date'];
    if (!acc[date]) {
      acc[date] = { date, clicks: 0, cost: 0, conversions: 0 };
    }
    acc[date].clicks += parseFloat(row['Clicks']) || 0;
    acc[date].cost += parseFloat(row['Cost']?.replace(/[^0-9.-]+/g, '')) || 0;
    acc[date].conversions += parseFloat(row['Conversions']) || 0;
    return acc;
  }, {});

  return {
    totalClicks,
    totalImpressions,
    totalCost: totalCost.toFixed(2),
    totalConversions,
    totalConvValue: totalConvValue.toFixed(2),
    ctr: ctr.toFixed(2),
    cpc: cpc.toFixed(2),
    convRate: convRate.toFixed(2),
    costPerConv: costPerConv.toFixed(2),
    roas: roas.toFixed(2),
    campaigns,
    dailyData: Object.values(dailyData).sort((a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
    dataPoints: data.length,
    dateRange: {
      start: data[data.length - 1]?.['Date'] || '',
      end: data[0]?.['Date'] || ''
    }
  };
}
