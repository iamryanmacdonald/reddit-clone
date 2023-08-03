import { SignIn } from "@clerk/nextjs";

import Modal from "~/components/modal";

export default function Page() {
  return (
    <Modal>
      <SignIn />
    </Modal>
  );
}
