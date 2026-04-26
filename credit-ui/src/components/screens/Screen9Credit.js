export default function Screen9Credit({ update }) {
  return (
    <div className="screen">
      <h2>Credit Behavior</h2>

      <label>External Score 1</label>
      <input type="range" min="0" max="1" step="0.01"
        onChange={(e) => update("ext1", e.target.value)} />

      <label>External Score 2</label>
      <input type="range" min="0" max="1" step="0.01"
        onChange={(e) => update("ext2", e.target.value)} />

      <label>External Score 3</label>
      <input type="range" min="0" max="1" step="0.01"
        onChange={(e) => update("ext3", e.target.value)} />
    </div>
  );
}