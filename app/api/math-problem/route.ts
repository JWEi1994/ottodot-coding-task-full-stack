import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../../../lib/supabaseClient";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const difficulty = body.difficulty || "medium";
    const problemType = body.problem_type || "mixed";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const difficultyGuide = {
      easy: "Use small numbers (1-50) and simple single-step operations.",
      medium:
        "Use moderate numbers (1-100) and may include two-step operations.",
      hard: "Use larger numbers (1-500) and multi-step operations with different operations combined.",
    };

    const typeGuide = {
      addition:
        "Focus only on addition problems (adding 2 or more numbers).",
      subtraction:
        "Focus only on subtraction problems (subtracting numbers).",
      multiplication:
        "Focus only on multiplication problems (multiplying numbers).",
      division:
        "Focus only on division problems (dividing numbers, ensure whole number answers).",
      mixed: "Use any combination of addition, subtraction, multiplication, or division.",
    };

    const prompt = `Generate a math word problem suitable for Primary 5 students (ages 10-11).

    DIFFICULTY: ${difficulty.toUpperCase()}
    ${difficultyGuide[difficulty as keyof typeof difficultyGuide]}

    PROBLEM TYPE: ${problemType.toUpperCase()}
    ${typeGuide[problemType as keyof typeof typeGuide]}

    The problem should be relatable to everyday situations.

    Return ONLY a JSON object in this exact format (no markdown, no code blocks):
    {
      "problem_text": "A detailed word problem here...",
      "final_answer": 42,
      "hint": "A helpful hint without giving away the answer",
      "solution_steps": "Step 1: ...\nStep 2: ...\nStep 3: Final answer is ..."
    }

    Make sure the final_answer is a number (integer or decimal).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response text to extract JSON
    let jsonText = text.trim();
    jsonText = jsonText.replace(/```json\s*/g, "").replace(/```\s*/g, "");

    const problemData = JSON.parse(jsonText);

    // Validate the response structure
    if (
      !problemData.problem_text ||
      typeof problemData.final_answer !== "number"
    ) {
      throw new Error("Invalid problem format from AI");
    }

    // Save to database
    const { data: session, error } = await supabase
      .from("math_problem_sessions")
      .insert({
        problem_text: problemData.problem_text,
        correct_answer: problemData.final_answer,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      session_id: session.id,
      problem: {
        problem_text: session.problem_text,
        final_answer: session.correct_answer,
        difficulty,
        problem_type: problemType,
        hint: problemData.hint,
        solution_steps: problemData.solution_steps,
      },
    });
  } catch (error) {
    console.error("Error generating problem:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate problem" },
      { status: 500 }
    );
  }
}
