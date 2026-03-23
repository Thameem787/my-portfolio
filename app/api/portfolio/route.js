import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data.json');
const ADMIN_PASSWORD = "admin123"; // In a real app, use an environment variable

export async function GET() {
  try {
    const file = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(file);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to read data' }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { data, password } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
    }

    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    
    return new Response(JSON.stringify({ message: 'Data saved successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save data' }), { status: 500 });
  }
}
