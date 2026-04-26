export default function Screen4Education({ update }) {
  return (
    <div className="screen">
      <h2>Education & Organization</h2>

      <div className="field">
        <label>Highest education</label>
        <select onChange={(e) => update("education", e.target.value)}>
          <option>Select</option>
          <option>High School</option>
          <option>Graduate</option>
          <option>Post Graduate</option>
        </select>
      </div>

      <div className="field">
        <label>Organization type</label>
        <input
          type="text"
          onChange={(e) => update("organization", e.target.value)}
        />
      </div>
    </div>
  );
}