// Root layout component
import Header from '@/components/Header';
import { TaskProvider } from '@/lib/taskStore';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <TaskProvider>
          <Header />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </TaskProvider>
      </body>
    </html>
  );
}