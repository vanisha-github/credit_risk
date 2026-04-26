export default function Screen6Loan({ update }) {
  return (
    <div className="screen">
      <h2>Loan Details</h2>

      <div className="field">
        <label>Type of loan</label>
        <select onChange={(e) => update("loanType", e.target.value)}>
          <option>Select</option>
          <option>Cash Loan</option>
          <option>Revolving</option>
        </select>
      </div>

      <div className="field">
        <label>Goods price (if applicable)</label>
        <input
          type="number"
          onChange={(e) => update("goodsPrice", e.target.value)}
        />
      </div>
    </div>
  );
}