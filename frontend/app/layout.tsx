import type React from "react";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <header className="border-b border-gray-200">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold">
              DevJobs
            </Link>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-gray-900">
                    Find Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/saved"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Saved Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account"
                    className="text-gray-600 hover:text-gray-900"
                  >
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
