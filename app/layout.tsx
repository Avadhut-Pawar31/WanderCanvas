import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ToastProvider } from "@/components/ToastProvider";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WanderCanvas — Less planning. More wondering.",
  description: "Turn the places you dream about into trips you'll remember. Discover destinations, build thoughtful itineraries, and organize every detail in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased selection:bg-[#244536]/15 selection:text-[#244536]">
        <Navbar />
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}

