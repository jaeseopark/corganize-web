import { sleep } from "utils/timeUtils";

export const hasChildren = (el) => el.children && el.children.length > 0;

export const getFirstChild = (el) => el.children[0];

export const getInnermostChild = (el) => {
  if (!el) return null;

  if (!hasChildren(el)) {
    return el;
  }
  return getInnermostChild(getFirstChild(el));
};

/**
 * Finds the HTML elements by classname. Used to target 3rd party components that cannot be referenced with the useRef() hook.
 * @param {string} clsName classname to search for
 * @param {number} interval number of milliseconds between iterations
 * @param {number} limit number of iterations before returning undefined
 * @returns Promise<HTMLElement[] | undefined>
 */
export const madReferenceByClassName = async (clsName, interval = 100, limit = 100) => {
  for (let i = 0; i < limit; i++) {
    const elements = document.getElementsByClassName(clsName);
    if (elements && elements.length > 0) {
      return Array.prototype.slice.call(elements);
    }
    await sleep(interval);
  }
};

/**
 * Focuses the first HTML Element matching the classname
 * @param {string} clsName
 * @returns boolean indicating whether or not the focus was successful
 */
export const madFocusByClassName = async (clsName) => {
  const elements = await madReferenceByClassName(clsName);
  if (elements) {
    const [inputElement] = elements;
    inputElement.focus();
    return true;
  }
  return false;
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

export const scrollToElement = (el) => {
  if (!el) {
    return;
  }
  el.scrollIntoView();
};
