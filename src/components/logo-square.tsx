import clsx from "clsx";
import Image from "next/image";

export default function LogoSquare({ size }: { size?: "sm" | undefined }) {
  return (
    <div
      className={clsx(
        "flex flex-none items-center justify-center",
        {
          "h-[80px] w-[80px]": !size,
          "h-[30px] w-[30px]": size === "sm",
        }
      )}
    >
      <Image
        src="/logo.png"
        alt="Logo"
        width={size === "sm" ? 30 : 80}
        height={size === "sm" ? 30 : 80}
        className="object-contain"
      />
    </div>
  );
}
