import { BN } from "@project-serum/anchor";

export function formatNumberCommas(num: number) {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
