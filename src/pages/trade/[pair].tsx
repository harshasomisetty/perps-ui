import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const { pair } = router.query;

  return (
    <div>
      <p>pair {pair} </p>
    </div>
  );
}
