import FolderCreator from "../../components/FolderCreator";

export default function CreateFolderPage() {
  // We render the shared component here.
  // If you need to redirect to a specific student dashboard later,
  // you could pass it as a prop like: <FolderCreator redirectPath="/dashboard" />
  return (
    <FolderCreator />
  );
}