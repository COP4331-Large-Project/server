import React from 'react';
import PropTypes from 'prop-types';

function Button({ variant, children, onClick }) {
  return (
    <button onClick={onClick} type="button" className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}

Button.defaultProps = {
  variant: 'primary',
};

Button.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
};

export default Button;
