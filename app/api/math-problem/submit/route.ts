import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '../../../../lib/supabaseClient'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { session_id, user_answer } = await request.json()

    if (!session_id || user_answer === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing session_id or user_answer' },
        { status: 400 }
      )
    }

    // Fetch the problem from database
    const { data: session, error: sessionError } = await supabase
      .from('math_problem_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if answer is correct
    const isCorrect = parseFloat(user_answer) === session.correct_answer

    // Generate personalized feedback using AI
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const feedbackPrompt = `You are a supportive math tutor for Primary 5 students (ages 10-11).

Problem: ${session.problem_text}
Correct Answer: ${session.correct_answer}
Student's Answer: ${user_answer}
Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}

Generate personalized, encouraging feedback for the student.

If CORRECT:
- Congratulate them warmly
- Explain why their answer is correct
- Optionally mention the strategy or concept they used well

If INCORRECT:
- Be gentle and encouraging
- Explain where they might have gone wrong
- Guide them toward the correct approach without being condescending
- Show the correct answer and explain why it's correct

Keep the feedback conversational, age-appropriate, and under 4 sentences.`

    const result = await model.generateContent(feedbackPrompt)
    const response = await result.response
    const feedback = response.text()

    // Save submission to database
    const { data: submission, error: submissionError } = await supabase
      .from('math_problem_submissions')
      .insert({
        session_id,
        user_answer: parseFloat(user_answer),
        is_correct: isCorrect,
        feedback_text: feedback
      })
      .select()
      .single()

    if (submissionError) {
      throw submissionError
    }

    return NextResponse.json({
      success: true,
      is_correct: isCorrect,
      feedback,
      correct_answer: session.correct_answer
    })
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit answer' },
      { status: 500 }
    )
  }
}
