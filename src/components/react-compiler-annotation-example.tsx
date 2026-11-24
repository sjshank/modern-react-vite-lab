import { useReactCompilerAnnotationExample } from '@hooks/useReactCompilerAnnotationExample';

export const ReactCompilerAnnotationExample = () => {
  'use memo'; // Indicates to the React compiler that this component should be memoized
  return (
    <div>
      <h1>React Compiler Annotation Example</h1>
      <p>This component demonstrates the use of React compiler annotations.</p>
    </div>
  );
};

export const ReactCompilerAnnotationExample1 = () => {
  'use no memo'; // Indicates to the React compiler that this component should not be memoized
  useReactCompilerAnnotationExample();
  return (
    <div>
      <h1>React Compiler Annotation Example 1</h1>
      <p>This component demonstrates the use of React compiler annotations.</p>
    </div>
  );
};
