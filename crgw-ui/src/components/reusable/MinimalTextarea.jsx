import cls from "classnames";

import "./MinimalTextarea.scss";

// TODO: Delete this cls
const MinimalTextarea = (props) => {
  const { className, ...rest } = props;
  return (
    <textarea
      className={cls(className, "minimal")}
      readOnly
      tabIndex="-1"
      rows="1"
      {...rest}
    />
  );
};

export default MinimalTextarea;
