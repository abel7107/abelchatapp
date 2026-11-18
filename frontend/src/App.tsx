
import NavigationRail from './components/layout/NavigationRail'

function App() {
  return (
    <div className="min-h-screen bg-app-bg text-primary flex">

      {/* Main navigation */}
      <NavigationRail />

      {/* Temporary conversation area */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-6">💬</div>

          <h1 className="text-3xl font-bold mb-3">
            Welcome to Abelchat
          </h1>

          <p className="text-secondary leading-relaxed">
            Your conversations belong here.
            Select a conversation or start connecting
            with someone new.
          </p>
        </div>
      </main>

    </div>
  )
}

export default App
