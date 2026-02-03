import LeftSidebar from "@/components/navigation/LeftSidebar";
import Navbar from "@/components/navigation/navbar";
import RightSidebar from "@/components/navigation/RightSidebar";
import "@mdxeditor/editor/style.css";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="background_light850_dark100 relative">
      <Navbar />
      <div className="flex">
        <LeftSidebar />
        <section className="flex min-h-screen flex-1 flex-col px-6 pt-36 pb-6 max-md:pb-14 sm:px-14">
          <div className="m-w-5xl mx-auto w-full">{children}</div>
        </section>

        <RightSidebar />
      </div>
    </main>
  );
};

export default RootLayout;
