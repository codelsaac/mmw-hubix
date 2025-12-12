export async function GET(req: Request) {
  return new Response('Test route works!', { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();
  return new Response(JSON.stringify({ message: 'Test POST received', body }), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json' } 
  });
}
