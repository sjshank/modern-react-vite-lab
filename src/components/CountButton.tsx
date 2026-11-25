// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CountButton = (props: any) => {
  const { count, setCount } = props;
  const countText = count ? `Count is ${count}` : 'Start the count';
  return (
    <button
      type="button"
      className="counter"
      onClick={() => setCount((count: number) => count + 1)}
    >
      {countText}
    </button>
  );
};

// JSX version of the component below
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const JsxComponent = () => {
//   return (
//     <div>
//       <p>Hello</p>
//     </div>
//   );
// };

// JSX transpiled/compiled version of the component above by Babel
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const JsxCompiledComponent = () => {
//   return React.createElement(
//     'div',
//     null,
//     React.createElement('p', null, 'Hello'),
//   );
// };

// React.createElement() function in the example above return an object like this:
console.log({
  type: 'div', // type of the element
  key: 'null', // key of the element. Used to identify elements in a list
  ref: 'null', // ref of the element. Used to access the underlying DOM node or React element
  props: {
    // props of the element. Contains all the attributes and children of the element.
    children: [
      {
        type: 'p',
        key: 'null',
        ref: 'null',
        props: {
          children: 'Hello',
        },
      },
    ],
  },
});
