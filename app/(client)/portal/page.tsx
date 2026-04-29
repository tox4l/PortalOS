import { redirect } from "next/navigation";
import { isDevBypass } from "@/lib/dev-bypass";

export default function PortalIndexPage() {
  if (isDevBypass()) {
    redirect("/demo/client");
  }

  redirect("/login");
}
