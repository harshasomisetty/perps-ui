import Link from "next/link";

export default function Page() {
  return (
    <>
      <p>trade page</p>
      <Link href="/trade/SOL-USD" className="link-primary link">
        SOL-USD
      </Link>
    </>
  );
}
