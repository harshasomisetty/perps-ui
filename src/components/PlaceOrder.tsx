export default function PlaceOrder() {
  return (
    <div className="card w-full max-w-sm flex-shrink-0 border border-neutral-focus bg-base-300 shadow-lg">
      <div className="card-body">
        <h2 className="card-title">Place a Market Order</h2>

        <div className="btn-group">
          <button
            className={`btn `}
            // onClick={() => {
            //   updateInputs(0, true);
            // }}
          >
            Long
          </button>
          <button className={`btn `}>Short</button>
          <button className={`btn `}>Swap</button>
        </div>
        <div className="flex flex-row">
          <p>Leverage</p>
          <input
            type="range"
            min="0"
            max="100"
            value="40"
            className="range"
            onChange={(e) => {
              console.log("change", e.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Type here"
            className="input w-full max-w-xs"
            onChange={(e) => {
              console.log("change", e.target.value);
            }}
          />
        </div>

        <table className="table w-full">
          <tbody>
            <tr>
              <td>Collateral In</td>
              <td>USDC</td>
            </tr>
            <tr>
              <td>Entry Price</td>
              <td>PLACEHOLDER</td>
            </tr>
            <tr>
              <td>Liq Price</td>
              <td>PLACEhodler</td>
            </tr>
            <tr>
              <td>Fees</td>
              <td>PLACEhodler</td>
            </tr>
          </tbody>
        </table>
        <button className="btn-primary btn">Place Trade</button>
      </div>
    </div>
  );
}
