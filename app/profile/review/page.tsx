import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/demo-session";
import { ProfileReviewForm } from "@/components/artiq/ProfileReviewForm";

export const dynamic = "force-dynamic";

export default async function ProfileReviewPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="py-2">
      <ProfileReviewForm />
    </div>
  );
}

