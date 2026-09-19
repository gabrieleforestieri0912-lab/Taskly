import { cn } from "@/lib/utils";

export function Section({
  className,
  variant = "default",
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  variant?: "default" | "alt" | "dark";
}) {
  const variants = {
    default: "bg-white dark:bg-[#0e0e0e] py-20 lg:py-28",
    alt: "bg-[#f6f7f9] dark:bg-[#0a0a0a] py-20 lg:py-28",
    dark: "bg-[#0a0a0a] dark:bg-black text-white py-20 lg:py-28",
  };
  return (
    <section
      className={cn("w-full px-6", variants[variant], className)}
      {...props}
    >
      {children}
    </section>
  );
}
