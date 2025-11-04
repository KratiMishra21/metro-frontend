"use client"

import { Github } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          {/* Branding */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">DM</span>
            </div>
            <span className="font-bold text-lg">Delhi Metro Navigator</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-gray-400">
            {[
              { label: "About", href: "#" },
              { label: "Privacy", href: "#" },
              { label: "GitHub Repo", href: "#" },
              { label: "Contact", href: "#" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-blue-400 transition-colors duration-300 flex items-center gap-1 group"
              >
                {link.label}
                {link.label === "GitHub Repo" && (
                  <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-500 to-transparent mb-8 opacity-50" />

        {/* Bottom text */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            Built with <span className="text-red-500">❤️</span> by Developers for Delhi Metro commuters.
          </p>
          <p className="mt-2 text-gray-600">© 2025 Delhi Metro Smart Navigator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
