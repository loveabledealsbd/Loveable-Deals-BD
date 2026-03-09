import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "Loveable Deals BD. - Shop smarter",
    description: "Loveable Deals BD. - Shop smarter",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                <AuthProvider>
                    <StoreProvider>
                        <Toaster />
                        {children}
                    </StoreProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
