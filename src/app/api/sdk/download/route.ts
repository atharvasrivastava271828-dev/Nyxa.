import { NextResponse } from 'next/server';
import { supabase } from '@/backend/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user is developer
    const { data: user, error } = await supabase
      .from('users')
      .select('is_developer')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.is_developer) {
      return NextResponse.json({ error: 'Unauthorized. Only developers can download the SDK.' }, { status: 403 });
    }

    // Serve the SDK zip file
    const filePath = path.join(process.cwd(), 'sdk', 'nyxa-sdk.zip');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'SDK file not found on server.' }, { status: 500 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="nyxa-sdk.zip"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
