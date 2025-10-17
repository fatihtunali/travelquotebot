import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    console.log('🧪 Testing Cloudinary connection...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set ✓' : 'Missing ✗');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set ✓' : 'Missing ✗');

    // Test the connection by getting account info
    const result = await cloudinary.api.ping();

    console.log('✅ Cloudinary ping successful:', result);

    return NextResponse.json({
      success: true,
      message: '✅ Cloudinary connection successful!',
      config: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKeySet: !!process.env.CLOUDINARY_API_KEY,
        apiSecretSet: !!process.env.CLOUDINARY_API_SECRET,
      },
      pingResult: result,
    });
  } catch (error: any) {
    console.error('❌ Cloudinary test failed:', error);
    return NextResponse.json(
      {
        error: 'Cloudinary connection failed',
        message: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
