import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DD Static Simulator | AG Brothers Investment",
  description: "Simulador de Probabilidad de Éxito – Monte Carlo Trading",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
