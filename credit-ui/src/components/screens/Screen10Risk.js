export default function Screen10Risk({ update }) {
  return (
    <div className="screen">
      <h2>Final Checks</h2>

      <div className="field">
        <label>Recent credit applications</label>
        <select onChange={(e) => update("creditFrequency", e.target.value)}>
          <option>Rarely</option>
          <option>Occasionally</option>
          <option>Frequently</option>
        </select>
      </div>

      <div className="field">
        <label>Documents available</label>
        <input
          type="number"
          onChange={(e) => update("documents", e.target.value)}
        />
      </div>

      <div className="field">
        <label>Last phone change</label>
        <select onChange={(e) => update("phoneChange", e.target.value)}>
          <option>Recent</option>
          <option>6 months</option>
          <option>1+ year</option>
        </select>
      </div>
    </div>
  );
}