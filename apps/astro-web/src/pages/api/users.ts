// Example: Using database in Astro API endpoint
import type { APIRoute } from 'astro';
import { getWebDb, users } from '@krag/database-web';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, request }) => {
  try {
    // Option 1: Use environment variable
    const db = getWebDb();
    
    // Option 2: Pass DATABASE_URL directly
    // const db = getWebDb(import.meta.env.DATABASE_URL);
    
    // Get all users
    const allUsers = await db.select().from(users);
    
    return new Response(JSON.stringify(allUsers), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const db = getWebDb();
    
    // Insert new user
    const result = await db.insert(users).values({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      isActive: true,
    });
    
    return new Response(JSON.stringify({ success: true, result }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create user' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
