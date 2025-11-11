import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main style={{ paddingBottom: "80px" }}>{children}</main>
      <Footer />
    </>
  );
}
