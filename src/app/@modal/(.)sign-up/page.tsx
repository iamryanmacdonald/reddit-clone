import { SignUp } from "@clerk/nextjs";

import Modal from "~/components/modal";

export default function Page() {
  return (
    <Modal>
      <SignUp />
    </Modal>
  );
}
