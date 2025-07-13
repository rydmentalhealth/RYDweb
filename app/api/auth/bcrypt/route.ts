import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

// This API route handles password hashing and comparison
// It should be used instead of importing bcrypt directly in client components

export async function POST(request: Request) {
  try {
    const { action, password, hash } = await request.json();
    
    if (action === "hash") {
      // Hash a password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return NextResponse.json({ hash: hashedPassword });
    } 
    else if (action === "compare") {
      // Compare a password with a hash
      const isMatch = await bcrypt.compare(password, hash);
      return NextResponse.json({ isMatch });
    } 
    else {
      return NextResponse.json(
        { error: "Invalid action. Use 'hash' or 'compare'." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Bcrypt API error:", error);
    return NextResponse.json(
      { error: "Failed to process password" },
      { status: 500 }
    );
  }
} 