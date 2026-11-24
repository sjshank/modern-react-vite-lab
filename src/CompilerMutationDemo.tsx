import { useState } from 'react';
import ItemList from '@components/ItemList';

export default function CompilerMutationDemo() {
  const [items, setItems] = useState(['First']);
  const [clicks, setClicks] = useState(0);

  function addByMutation() {
    // Deliberately breaks React's immutability rule to demonstrate stale compiler output.
    items.push(`Item ${items.length + 1}`); // Rules of React violation. Should not mutate state directly
    setItems(items);
    setClicks((previous) => previous + 1);
  }

  function addImmutably() {
    setItems((previous) => [...previous, `Item ${previous.length + 1}`]); // Correct way to update state immutably
    setClicks((previous) => previous + 1);
  }

  function reset() {
    setItems(['First']);
    setClicks(0);
  }

  return (
    <section id="compiler-demo" aria-labelledby="compiler-demo-title">
      <h2 id="compiler-demo-title">React Compiler: mutation pitfall</h2>
      <p>
        This intentionally broken example compiles successfully but can show
        stale UI. Mutating the array keeps its reference unchanged, so the
        compiled list reuses its cached output.
      </p>
      <div className="compiler-demo-actions">
        <button type="button" className="counter" onClick={addByMutation}>
          Add by mutation (broken)
        </button>
        <button type="button" className="counter" onClick={addImmutably}>
          Add immutably (fixed)
        </button>
        <button type="button" className="counter" onClick={reset}>
          Reset demo
        </button>
      </div>
      <p aria-live="polite">
        Add clicks: {clicks}. Items in state: {items.length}.
      </p>
      <h3>Compiled list</h3>
      <ItemList items={items} />
      <p>
        Try the broken button first: the counts change but the list stays stale.
        The fixed button creates a new array and displays all accumulated items.
        Reset before trying again.
      </p>
    </section>
  );
}
