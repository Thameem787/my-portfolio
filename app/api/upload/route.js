import { put } from '@vercel/blob';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    // Upload directly to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Return the blob URL (this is a permanent public URL)
    return new Response(JSON.stringify({ url: blob.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Blob Upload Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to upload image to cloud' }), { status: 500 });
  }
}
