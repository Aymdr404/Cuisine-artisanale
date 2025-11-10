"use client";
import React, { ReactNode, useEffect, useMemo } from "react";
import "./AdminPanel.css";
import { useAuth } from "@/contexts/AuthContext/AuthContext";
import Sidebar from "@/components/SideBarAdminPanel/SideBarAdminPanel";
import { Card } from "primereact/card";
import dynamic from "next/dynamic"; // ✅
import { Message } from "primereact/message";
import { useRouter, usePathname } from "next/navigation";

const BreadCrumb = dynamic(
  () => import("primereact/breadcrumb").then((mod) => mod.BreadCrumb),
  { ssr: false }
);

type AdminPanelProps = {
  children: ReactNode;
};

const ROUTE_LABELS: Record<string, string> = {
  "admin-panel": "Administration",
  dashboard: "Tableau de bord",
  users: "Utilisateurs",
  posts: "Posts",
  recettes: "Recettes",
  ingredients: "Ingrédients",
  units: "Unités",
};

const AdminPanel: React.FC<AdminPanelProps> = ({ children }) => {
  const { user, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (role && role !== "admin") {
      router.replace("/");
    }
  }, [role, router]);

  const breadcrumbItems = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const adminIndex = segments.indexOf("admin-panel");
    if (adminIndex === -1) return [];

    const relevantSegments = segments.slice(adminIndex);

    return relevantSegments.map((segment, index) => {
      const url = "/" + segments.slice(0, adminIndex + index + 1).join("/");
      const label =
        ROUTE_LABELS[segment] ??
        segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
      return { label, url };
    });
  }, [pathname]);

  const home = { icon: "pi pi-home", url: "/" };

  if (role && role !== "admin") {
    return (
      <div className="access-denied">
        <Message
          severity="error"
          text="Accès refusé. Cette page est réservée aux administrateurs."
        />
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <Sidebar />

      <div className="admin-main">
        <div className="admin-header">
          <BreadCrumb
            model={breadcrumbItems}
            home={home}
            className="admin-breadcrumb"
          />

          <div className="admin-user-info">
            <span className="welcome-text">
              Bienvenue, {user?.displayName || "Administrateur"}
            </span>
          </div>
        </div>

        <Card className="admin-content">{children}</Card>
      </div>
    </div>
  );
};

export default AdminPanel;
