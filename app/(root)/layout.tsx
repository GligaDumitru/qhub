import LeftSidebar from "@/components/navigation/LeftSidebar";
import Navbar from "@/components/navigation/Navbar";
import RightSidebar from "@/components/navigation/RightSidebar";
import "@mdxeditor/editor/style.css";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="background_light850_dark100 relative flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <section className="flex min-h-full flex-1 flex-col overflow-scroll p-6 max-md:pb-14 sm:px-14">
          <div className="m-w-5xl mx-auto w-full">{children}</div>
        </section>

        <RightSidebar />
      </div>
    </main>
  );
};

export default RootLayout;
