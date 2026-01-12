import "./globals.css";
import Navbar from "@/app/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen text-white antialiased transition-colors duration-300">
        {/* Background gradient + subtle diagonal streaks */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-black via-[#0a0f1f] to-[#000814]" />
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.22] [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_12px)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.18] [background:radial-gradient(60%_40%_at_20%_0%,rgba(37,99,235,0.15),transparent),radial-gradient(50%_40%_at_80%_20%,rgba(147,197,253,0.10),transparent)]" />

        <Navbar />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}
