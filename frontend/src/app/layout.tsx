import type { Metadata } from "next";
import "./[locale]/globals.css";

export const metadata: Metadata = {
  title: 'SensorPump',
  description: 'DADN242-L07-15',
  applicationName: 'SensorPump',
  keywords: ["react", "server components", 'nextjs', 'tailwind'],
  icons: [{ rel: "favicon", type: 'image/ico', url: "/favicon.ico" }],
  generator: 'nhanhcmut',
  authors: [{ name: 'nhanhcmut' }],
  creator: 'nhanhcmut',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" className="h-dvh w-dvw" suppressHydrationWarning={true}>
      <body>
        {children}
      </body>
    </html>
  );
};