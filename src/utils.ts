const varNameToString = (varObj) => Object.keys(varObj)[0];

export const printNotFound = (element: Element | null) => {
  if (!element) {
    console.info("element not found: ", varNameToString({ element }));
    return false;
  }
  return true;
};
