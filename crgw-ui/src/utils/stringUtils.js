export const htmlDecode = (input) => new DOMParser().parseFromString(input, "text/html").body.textContent;
