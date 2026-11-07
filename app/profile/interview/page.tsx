import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/demo-session";
import { getInterviewAnswersAction } from "@/app/profile/interview-actions";
import { ProfileInterview } from "@/components/artiq/ProfileInterview";

export const dynamic = "force-dynamic";

export default async function InterviewPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const initialAnswers = await getInterviewAnswersAction();

  return (
    <div className="py-2">
      <ProfileInterview initialAnswers={initialAnswers} />
    </div>
  );
}

