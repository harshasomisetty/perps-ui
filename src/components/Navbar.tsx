import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Link from "next/link";

const TABS: string[] = ["home"];

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const Navbar = () => {
  const router = useRouter();

  return (
    <div className="border-rounded navbar flex flex-row justify-between rounded-lg border-neutral bg-neutral-focus ">
      <div className="navbar-start">
        <Link href="/">
          <div className="btn btn-ghost text-3xl font-light normal-case hover:btn-link">
            LOGO
          </div>
        </Link>
      </div>
      <div className="navbar-center">
        <ul className="menu menu-horizontal p-0">
          {TABS.slice(1).map((tabName) => (
            <li
              className={`${
                router.pathname.slice(1).split("/")[0] === tabName
                  ? "rounded-none border-b border-primary"
                  : ""
              } `}
              key={tabName}
            >
              <Link href={"/" + tabName}>
                <div>{tabName}</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="navbar-end flex flex-row space-x-2 ">
        <WalletMultiButtonDynamic />
      </div>
    </div>
  );
};

export default Navbar;
