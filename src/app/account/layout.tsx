import type { Metadata } from "next";
import type { ReactNode } from "react";
import AccountLayout from "@/pages-legacy/Account/Account";

export const metadata: Metadata = {
	title: "Mon compte | Cuisine artisanale",
};

export default function AccountSectionLayout({ children }: { children: ReactNode }) {
	return <AccountLayout>{children}</AccountLayout>;
}


