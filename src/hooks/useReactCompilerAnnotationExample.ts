export const useReactCompilerAnnotationExample = () => {
  'use memo'; // Indicates to the React compiler that this hook should be memoized
  console.log(import.meta.env.SERVER_ONLY_DEMO == undefined);
  console.log(import.meta.env.MODE == 'development');
  return 'This is a custom hook demonstrating React compiler annotations.';
};
