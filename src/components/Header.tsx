import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Link to="/" className="flex items-center">
          <img
            src="/tanstack-word-logo-white.svg"
            alt="TanStack Logo"
            className="h-8"
          />
          <span className="ml-4 text-xl font-semibold">DPC Authorization Prototype</span>
        </Link>
      </div>
    </header>
  )
}
