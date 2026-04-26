export default function Screen3Employment({ update }) {
  return (
    <div className="screen">
      <h2>Your Work Profile</h2>

      <div className="field">
        <label>What is your occupation?</label>
        <input
          type="text"
          onChange={(e) => update("occupation", e.target.value)}
        />
      </div>

      <div className="field">
        <label>Type of income</label>
        <select onChange={(e) => update("incomeType", e.target.value)}>
          <option>Select</option>
          <option>Working</option>
          <option>Business</option>
          <option>Pension</option>
        </select>
      </div>

      <div className="field">
        <label>Years of employment</label>
        <input
          type="number"
          onChange={(e) => update("employmentYears", e.target.value)}
        />
      </div>
    </div>
  );
}