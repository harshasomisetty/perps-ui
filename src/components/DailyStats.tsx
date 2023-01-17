interface DailyStatsProps {
  price: number;
  change: number;
  high: number;
  low: number;
}
export default function DailyStats({
  price = 0,
  change = 0,
  high = 0,
  low = 0,
}: DailyStatsProps) {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Price</th>
            <th>24h Change</th>
            <th>24h High</th>
            <th>24h Low</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>{price}</th>
            <td>{change}</td>
            <td>{high}</td>
            <td>{low}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
