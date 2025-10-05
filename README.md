# Math Problem Generator - Developer Assessment Starter Kit

## Overview

This is a starter kit for building an AI-powered math problem generator application. The goal is to create a standalone prototype that uses AI to generate math word problems suitable for Primary 5 students, saves the problems and user submissions to a database, and provides personalized feedback.

## Tech Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI Integration**: Google Generative AI (Gemini)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd math-problem-generator
```

### 2. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → API to find your:
   - Project URL (starts with `https://`)
   - Anon/Public Key

### 3. Set Up Database Tables

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `database.sql`
3. Click "Run" to create the tables and policies

### 4. Get Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini

### 5. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Edit `.env.local` and add your actual keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   GOOGLE_API_KEY=your_actual_google_api_key
   ```

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Your Task

### 1. Implement Frontend Logic (`app/page.tsx`)

Complete the TODO sections in the main page component:

- **generateProblem**: Call your API route to generate a new math problem
- **submitAnswer**: Submit the user's answer and get feedback

### 2. Create Backend API Route (`app/api/math-problem/route.ts`)

Create a new API route that handles:

#### POST /api/math-problem (Generate Problem)
- Use Google's Gemini AI to generate a math word problem
- The AI should return JSON with:
  ```json
  {
    "problem_text": "A bakery sold 45 cupcakes...",
    "final_answer": 15
  }
  ```
- Save the problem to `math_problem_sessions` table
- Return the problem and session ID to the frontend

#### POST /api/math-problem/submit (Submit Answer)
- Receive the session ID and user's answer
- Check if the answer is correct
- Use AI to generate personalized feedback based on:
  - The original problem
  - The correct answer
  - The user's answer
  - Whether they got it right or wrong
- Save the submission to `math_problem_submissions` table
- Return the feedback and correctness to the frontend

### 3. Requirements Checklist

- [x] AI generates appropriate Primary 5 level math problems
- [x] Problems and answers are saved to Supabase
- [x] User submissions are saved with feedback
- [x] AI generates helpful, personalized feedback
- [x] UI is clean and mobile-responsive
- [x] Error handling for API failures
- [x] Loading states during API calls

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add your environment variables in Vercel's project settings
4. Deploy!

## Assessment Submission

When submitting your assessment, provide:

1. **GitHub Repository URL**: Make sure it's public
2. **Live Demo URL**: Your Vercel deployment
3. **Supabase Credentials**: Add these to your README for testing:
   ```
   SUPABASE_URL: https://qxpfjkkbsptfodxuenah.supabase.co
   SUPABASE_ANON_KEY: sb_publishable_9UGN0DooklXRFZC3dUEXuw_UMuU4KSC
   ```

## Implementation Notes

### My Implementation:

**Tech Stack & APIs:**

- Built with Next.js 14 App Router and TypeScript for type safety
- Integrated Google Gemini AI (gemini-2.0-flash) for problem generation and personalized feedback
- Supabase for database with Row Level Security policies enabled
- Tailwind CSS for responsive, modern UI design

**Key Features Implemented:**

- **AI-Powered Problem Generation**: Dynamic word problems with configurable difficulty (Easy/Medium/Hard) and problem types (Addition, Subtraction, Multiplication, Division, Mixed)
- **Intelligent Feedback System**: AI generates personalized, age-appropriate feedback based on student answers
- **Gamification**: Score tracking system with visual progress bar, difficulty-based points (1-3 pts), hint penalty system (-1 pt), and confetti animation on correct answers
- **Solution Support**: Hint system and step-by-step solution explanations returned from AI
- **History Tracking**: Full problem and submission history with timestamps via `/api/history` endpoint
- **Database Design**: Two-table schema with foreign key relationships and proper indexing for performance

**Design Decisions:**

- Used Gemini 2.0 Flash for faster response times while maintaining quality
- Implemented client-side score tracking using localStorage for persistence across sessions
- Added hint penalty system to encourage independent problem-solving
- Database schema includes additional columns (difficulty, problem_type, hint, solution_steps) beyond base requirements for enhanced features

**Challenges Overcome:**

- Parsing AI-generated JSON responses reliably by cleaning markdown code blocks
- Implementing proper error handling and loading states for better UX
- Creating a responsive UI that works seamlessly on mobile and desktop devices
- Designing a scoring system that balances encouragement with challenge

## Additional Features (Optional)

Implemented additional features:

- [x] Difficulty levels (Easy/Medium/Hard)
- [x] Problem history view
- [x] Score tracking with progress bar
- [x] Different problem types (addition, subtraction, multiplication, division, mixed)
- [x] Hints system (with point deduction)
- [x] Step-by-step solution explanations
- [x] Confetti animation on correct answers
- [x] Score reset functionality
- [x] Visual scoring system (Easy: 1pt, Medium: 2pts, Hard: 3pts)
- [x] Penalty system for using hints (-1 point)

---

Good luck with your assessment! 🎯