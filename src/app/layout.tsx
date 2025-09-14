import type { Metadata } from "next";
import "./globals.css";
import { Cart } from '@/components/client/Cart';
import { ToastProvider } from '@/components/ui/ToastProvider';

export const metadata: Metadata = {
  title: "MnuFood - Marketplace de restaurants à Dakar",
  description: "Découvrez les meilleurs restaurants de Dakar et commandez en ligne",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
        <Cart />
        <ToastProvider />
      </body>
    </html>
  );
}