export default function Screen8Region({ update }) {
  return (
    <div className="screen">
      <h2>Location Insights</h2>

      <div className="field">
        <label>Region rating</label>
        <select onChange={(e) => update("regionRating", e.target.value)}>
          <option>1</option>
          <option>2</option>
          <option>3</option>
        </select>
      </div>

      <div className="field">
        <label>Population density</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          onChange={(e) => update("population", e.target.value)}
        />
      </div>
    </div>
  );
}