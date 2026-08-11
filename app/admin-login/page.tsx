import type { Metadata } from "next";
import { LoginPanel } from "../LoginPanel";

export const metadata: Metadata = {
  title: "Admin Sign In | LordsCare",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <main className="login-page admin-login-page"><LoginPanel adminOnly /></main>;
}
