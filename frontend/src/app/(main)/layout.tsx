import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'

import QuickViewModal from '@/components/features/movies/QuickViewModal'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      <QuickViewModal />
    </div>
  )
}
