import { LuMessageCircle } from "react-icons/lu";
import PropTypes from "prop-types";

export default function Button({
  title = "Login/Register",
  Icon = LuMessageCircle,
  className = "",
  onClick = () => {

  },
}) {
  return (
    <button
      onClick={onClick}
      className={`border border-white-700 flex items-center gap-2 rounded-full px-7 py-4 text-lg font-semibold text-white transition hover:-rotate-3 ${className}`}
    >
      <Icon className="size-6" />
      {title}
    </button>
  );
}

Button.propTypes = {
  title: PropTypes.string,
  Icon: PropTypes.elementType,
  className: PropTypes.string,
  onClick: PropTypes.func,
};
