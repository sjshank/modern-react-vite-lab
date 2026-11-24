export default function ItemList({ items }: { items: string[] }) {
  'use memo';

  // It demonstrates how React can memoize the rendered list based on the items array reference.
  return (
    <ul>
      {/* // If rules of immutability are violated and the array reference doesn't change, React may reuse the cached output and the UI may not update as expected even though the underlying data has changed because we are using memoization based on the array reference. */}
      {items.map((eachItem, index) => (
        <li key={`${eachItem}_${index}`}>{eachItem}</li>
      ))}
    </ul>
  );
}
