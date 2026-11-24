const hooks: any[] = []; // Array to store hook state pairs
let currentHookIndex = 0; // Index to keep track of the current hook being accessed

// Custom hook to mimic React's useState behavior in a simplified way
export const useStateHook = (initialValue: any) => {
  let hookPair = hooks[currentHookIndex]; // Get the current hook state pair from the hooks array
  // If the hook state pair exists, return it and move to the next hook index
  if (hookPair) {
    currentHookIndex++;
    return hookPair;
  }

  // If the hook state pair doesn't exist, create it with the initial value and a setter function
  hookPair = [initialValue, setState];

  function setState(newValue: any) {
    // Update the state value in the hook pair
    hookPair[0] = newValue;
    //update dom or trigger re-render if necessary
  }

  hooks[currentHookIndex] = hookPair; // Store the new hook state pair in the hooks array
  currentHookIndex++;
  return hookPair;
};
