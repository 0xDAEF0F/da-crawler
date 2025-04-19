import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Briefcase, Bookmark, User } from "lucide-react";
import Link from "next/link";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevJobs - Find Your Next Developer Role",
  description:
    "A job board focused on developer roles with a focus on user experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased`}>
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/75 shadow-md backdrop-blur">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              DevJobs
            </Link>
            <nav>
              <ul className="flex space-x-8">
                <li>
                  <Link
                    href="/"
                    className="flex items-center text-gray-600 transition-colors hover:text-gray-900"
                  >
                    <Briefcase className="mr-2" size={20} />
                    Find Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/saved"
                    className="flex items-center text-gray-600 transition-colors hover:text-gray-900"
                  >
                    <Bookmark className="mr-2" size={20} />
                    Saved Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account"
                    className="flex items-center text-gray-600 transition-colors hover:text-gray-900"
                  >
                    <User className="mr-2" size={20} />
                    Account
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <NuqsAdapter>{children}</NuqsAdapter>
        <footer className="mt-12 border-t border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} DevJobs. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
