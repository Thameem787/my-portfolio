import { kv } from '@vercel/kv';
import { promises as fs } from 'fs';
import path from 'path';

const ADMIN_PASSWORD = "admin123";

export async function GET() {
  let data = null;
  
  try {
    // Try to get from KV first
    data = await kv.get('portfolio_data');
  } catch (error) {
    console.error("KV Read Error (falling back):", error);
  }
    
  try {
    // Fallback to local data.json if KV is empty or fails
    if (!data) {
      const DATA_PATH = path.join(process.cwd(), 'data.json');
      const file = await fs.readFile(DATA_PATH, 'utf8');
      data = JSON.parse(file);
      
      // Try to initialize KV with local data (silent fail if KV is still down)
      try {
        await kv.set('portfolio_data', data);
      } catch (e) {}
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Critical Read Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to read portfolio data' }), { status: 500 });
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
    return new Response(JSON.stringify({ error: 'Failed to save data. Please ensure Vercel KV is connected.' }), { status: 500 });
  }
}
