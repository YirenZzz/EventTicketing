import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Test the database connection by counting users
    const userCount = await prisma.user.count();
    
    return NextResponse.json({ 
      message: "Successfully connected to the database!",
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Database connection error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to connect to the database", 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}