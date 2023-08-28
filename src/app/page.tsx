import Sidebar from "~/components/sidebar";

export default async function Home() {
  return (
    <div className="flex">
      <div className="grow">Content</div>
      <Sidebar />
    </div>
  );
}
