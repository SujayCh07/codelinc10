"use client"

import { type FormEvent, useState } from "react"

type ViewState = "landing" | "login" | "signup" | "confirmation"

type Submission = {
  mode: "login" | "signup"
  name?: string
  email: string
}

export default function Home() {
  const [view, setView] = useState<ViewState>("landing")
  const [submission, setSubmission] = useState<Submission | null>(null)

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const rawEmail = ((form.get("email") as string | null) ?? "").trim()
    const email = rawEmail
    const name = rawEmail.split("@")[0] || "Guest"
    setSubmission({ mode: "login", name, email })
    setView("confirmation")
  }

  const handleSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const firstName = ((form.get("firstName") as string | null) ?? "").trim()
    const lastName = ((form.get("lastName") as string | null) ?? "").trim()
    const email = ((form.get("email") as string | null) ?? "").trim()
    const name = [firstName, lastName].filter(Boolean).join(" ") || "New FinMate member"
    setSubmission({ mode: "signup", name, email })
    setView("confirmation")
  }

  const resetFlow = () => {
    setView("landing")
    setSubmission(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-12">
        <header className="flex flex-col items-center text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">FinMate</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Your friendly benefits buddy</h1>
          <p className="mt-4 max-w-xl text-base text-neutral-600 md:text-lg">
            This demo keeps it simple: start from the FinMate landing page and jump into a fake log in or sign up flow to
            imagine how your future benefits hub could greet teammates.
          </p>
        </header>

        <div className="w-full max-w-xl rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-lg backdrop-blur">
          {view === "landing" && (
            <div className="flex flex-col items-center gap-6">
              <p className="text-center text-neutral-600">
                Pick an option below to see a lightweight experience. Both the login and sign up paths are purely visual and
                don&apos;t connect to a real account.
              </p>
              <div className="flex w-full flex-col gap-3 md:flex-row">
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="w-full rounded-full bg-rose-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-rose-600 active:scale-95"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => setView("signup")}
                  className="w-full rounded-full border border-rose-500 px-6 py-3 text-base font-semibold text-rose-500 transition hover:bg-rose-50 active:scale-95"
                >
                  Sign up
                </button>
              </div>
            </div>
          )}

          {view === "login" && (
            <form className="flex flex-col gap-5" onSubmit={handleLogin}>
              <div>
                <h2 className="text-2xl font-semibold">Welcome back</h2>
                <p className="mt-1 text-sm text-neutral-600">Use any email and password to preview the login handoff.</p>
              </div>
              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
                Email address
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 shadow-sm focus:border-rose-400 focus:outline-none focus:ring focus:ring-rose-200"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
                Password
                <input
                  required
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 shadow-sm focus:border-rose-400 focus:outline-none focus:ring focus:ring-rose-200"
                />
              </label>
              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-rose-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-rose-600 active:scale-95"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => setView("signup")}
                className="text-sm font-medium text-rose-500 underline-offset-4 hover:underline"
              >
                Need an account? Create one instead.
              </button>
              <button
                type="button"
                onClick={resetFlow}
                className="text-sm font-medium text-neutral-500 underline-offset-4 hover:underline"
              >
                Back to landing
              </button>
            </form>
          )}

          {view === "signup" && (
            <form className="flex flex-col gap-5" onSubmit={handleSignup}>
              <div>
                <h2 className="text-2xl font-semibold">Join the FinMate family</h2>
                <p className="mt-1 text-sm text-neutral-600">This mock sign up collects basic details but never stores them.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
                  First name
                  <input
                    required
                    name="firstName"
                    type="text"
                    placeholder="Taylor"
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 shadow-sm focus:border-rose-400 focus:outline-none focus:ring focus:ring-rose-200"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
                  Last name
                  <input
                    required
                    name="lastName"
                    type="text"
                    placeholder="Jordan"
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 shadow-sm focus:border-rose-400 focus:outline-none focus:ring focus:ring-rose-200"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
                Work email
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="taylor.jordan@work.com"
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 shadow-sm focus:border-rose-400 focus:outline-none focus:ring focus:ring-rose-200"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-neutral-700">
                Create password
                <input
                  required
                  name="password"
                  type="password"
                  placeholder="Choose something memorable"
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 shadow-sm focus:border-rose-400 focus:outline-none focus:ring focus:ring-rose-200"
                />
              </label>
              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-rose-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-rose-600 active:scale-95"
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => setView("login")}
                className="text-sm font-medium text-rose-500 underline-offset-4 hover:underline"
              >
                Already with us? Log in instead.
              </button>
              <button
                type="button"
                onClick={resetFlow}
                className="text-sm font-medium text-neutral-500 underline-offset-4 hover:underline"
              >
                Back to landing
              </button>
            </form>
          )}

          {view === "confirmation" && submission && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="rounded-full bg-rose-500/10 p-4">
                <span className="text-3xl" role="img" aria-label="party popper">
                  🎉
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">All set, {submission.name}!</h2>
                <p className="text-sm text-neutral-600">
                  You just completed the mock {submission.mode === "login" ? "log in" : "sign up"} experience with <strong>{submission.email || "your email"}</strong>.
                </p>
                <p className="text-sm text-neutral-500">
                  In a real build this hand-off would route you to personalized benefits, but for now it&apos;s just a friendly demo.
                </p>
              </div>
              <button
                type="button"
                onClick={resetFlow}
                className="rounded-full bg-rose-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-rose-600 active:scale-95"
              >
                Back to landing
              </button>
            </div>
          )}
        </div>

        <footer className="text-center text-xs text-neutral-400">
          This FinMate prototype skips real authentication. Use it to visualize how a lightweight entry flow could look and feel
          on mobile.
        </footer>
      </div>
    </main>
  )
}
