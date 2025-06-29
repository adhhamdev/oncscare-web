import { Logo } from "@/components/logo";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex flex-col space-y-2 items-center justify-center h-screen">
      <Image
        src="/logo.png"
        alt="Logo"
        priority
        fetchPriority="high"
        loading="eager"
        width={100}
        height={100}
      />
      <Logo />
    </div>
  );
}
