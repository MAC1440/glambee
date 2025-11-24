"use client";

import { useEffect } from "react";

export function PermissionRefresher() {
  useEffect(() => {
    const refreshPermissions = async () => {
      try {
        const sessionRaw = localStorage.getItem("session");
        if (!sessionRaw) return;

        const session = JSON.parse(sessionRaw);

        // Super admins / salon admin — no need to fetch permissions
        if (
          session.role === "SUPER_ADMIN" ||
          session.role === "SALON_ADMIN" ||
          session.userType === "SUPER_ADMIN" ||
          session.userType === "SALON_ADMIN"
        ) {
          return;
        }

        // Staff user → fetch & update
        const { fetchAndUpdatePermissions } = await import("@/hooks/use-permissions");
        const updated = await fetchAndUpdatePermissions(session.id);

        if (updated) {
          localStorage.setItem("permissions", JSON.stringify(updated));
          window.dispatchEvent(new Event("sessionUpdated"));
        }
      } catch (err) {
        console.error("Permission refresh failed:", err);
      }
    };

    refreshPermissions();
  }, []);

  return null;
}
