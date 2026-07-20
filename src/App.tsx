function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
          GamePlan
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Sports Operations Task Board
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Organize team operations, game preparation, media tasks, and
          administrative work in one place.
        </p>

        <button
          type="button"
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Create task
        </button>
      </section>
    </main>
  )
}

export default App
