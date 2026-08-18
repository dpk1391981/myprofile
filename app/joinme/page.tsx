import { redirect } from "next/navigation";

/** The hire form now lives at /contact — keep the old URL working. */
export default function JoinMePage() {
  redirect("/contact");
}
