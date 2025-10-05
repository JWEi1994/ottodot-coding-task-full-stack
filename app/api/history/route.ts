import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Fetch recent problems with their submissions
    const { data: sessions, error } = await supabase
      .from("math_problem_sessions")
      .select(
        `
        id,
        created_at,
        problem_text,
        correct_answer,
        math_problem_submissions (
          user_answer,
          is_correct,
          feedback_text,
          created_at
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      history: sessions,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
