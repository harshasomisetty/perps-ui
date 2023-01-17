import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  children: [React.ReactNode, React.ReactNode];
}

export function SidebarLayout(props: Props) {
  return (
    <div
      className={twMerge(
        "max-w-7xl",
        "mx-auto",
        "px-4",
        "w-full",
        "lg:gap-x-16",
        "lg:grid-cols-[1fr,424px]",
        "lg:grid",
        "lg:px-16",
        props.className
      )}
    >
      <div>{props.children[0]}</div>
      <div>{props.children[1]}</div>
    </div>
  );
}
