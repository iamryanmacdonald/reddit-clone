import { SignIn } from "@clerk/nextjs";
import Modal from "~/components/modal";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <SignIn />
    </main>
  );
}
