import { Inter } from "next/font/google";
import { Raleway } from "next/font/google";
import { Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const raleway = Raleway({ subsets: ["latin"] });
const poppins = Poppins({ subsets: ["latin"] , weight: '500'});

export const metadata = {
  title: "Fit Fusion",
  description: "AI-powered fitness and wellness platform offering personalized features for users.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
