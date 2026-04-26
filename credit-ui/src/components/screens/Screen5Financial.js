export default function Screen5Financial({ update }) {
  return (
    <div className="screen">
      <h2>Financial Details</h2>

      <div className="field">
        <label>Annual income (₹)</label>
        <input
          type="number"
          onChange={(e) => update("income", e.target.value)}
        />
      </div>

      <div className="field">
        <label>Loan amount required (₹)</label>
        <input
          type="number"
          onChange={(e) => update("credit", e.target.value)}
        />
      </div>

      <div className="field">
        <label>Monthly EMI (₹)</label>
        <input
          type="number"
          onChange={(e) => update("emi", e.target.value)}
        />
      </div>
    </div>
  );
}