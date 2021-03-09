import React from 'react';
import PropTypes from 'prop-types';

function Button({
  className, variant, children, onClick,
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
}

Button.defaultProps = {
  variant: 'primary',
  children: [],
  onClick: () => {},
  className: '',
};

Button.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Button;
