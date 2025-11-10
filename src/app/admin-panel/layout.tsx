import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminPanelLayout from "@/pages-legacy/AdminPanel/AdminPanel";

export const metadata: Metadata = {
	title: "Administration | Cuisine artisanale",
};

export default function AdminPanelRootLayout({ children }: { children: ReactNode }) {
	return <AdminPanelLayout>{children}</AdminPanelLayout>;
}


