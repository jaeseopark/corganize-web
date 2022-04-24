export const hasChildren = (el) => el.children && el.children.length > 0;

export const getFirstChild = (el) => el.children[0];

export const getInnermostChild = (el) => {
  if (!el) return null;

  if (!hasChildren(el)) {
    return el;
  }
  return getInnermostChild(getFirstChild(el));
};

export const madFocus = (el, shouldTargetChild = false, interval = 100, initialDelay = 100) => {
  const getTargetElement = () => {
    if (shouldTargetChild) {
      return getInnermostChild(el);
    }
    return el;
  };

  const focus = () => {
    const target = getTargetElement();
    if (target) return target.focus();
    setTimeout(focus, interval);
  };

  setTimeout(focus, initialDelay);
};
