import { kv } from '@vercel/kv';
import { promises as fs } from 'fs';
import path from 'path';

const ADMIN_PASSWORD = "admin123";

export async function GET() {
  try {
    // Try to get from KV first
    let data = await kv.get('portfolio_data');
    
    // Fallback to local data.json if KV is empty (e.g., first run)
    if (!data) {
      const DATA_PATH = path.join(process.cwd(), 'data.json');
      const file = await fs.readFile(DATA_PATH, 'utf8');
      data = JSON.parse(file);
      // Initialize KV with local data
      await kv.set('portfolio_data', data);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("KV Read Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to read data from database' }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { data, password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
    }

    // Save to KV permanently
    await kv.set('portfolio_data', data);
    
    return new Response(JSON.stringify({ message: 'Data saved successfully to cloud' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("KV Write Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to save data to database' }), { status: 500 });
  }
}
