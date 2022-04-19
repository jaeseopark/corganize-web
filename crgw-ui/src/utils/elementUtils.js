export const hasChildren = (el) => el.children && el.children.length > 0;

export const getFirstChild = (el) => el.children[0];

export const getInnermostChild = (el) => {
  if (!hasChildren(el)) {
    return el;
  }
  return getInnermostChild(getFirstChild(el));
};
