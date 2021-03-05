import React from 'react';
import '../scss/Button.scss';
import '../scss/App.scss';

function Catalogue() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        justifyItems: 'center',
      }}
    >
      <h1>Buttons</h1>
      <div className="Display-Box">
        <button type="button" className="btn btn-primary">
          .btn btn-primary
        </button>
        <button type="button" className="btn btn-danger">
          .btn btn-danger
        </button>
        <button type="button" className="btn btn-success">
          .btn btn-success
        </button>
        <button type="button" className="btn btn-warning">
          .btn btn-warning
        </button>
      </div>
      <h1>Card</h1>
      <div className="Display-Box">
        <div className="Card">.Card - Displays a Block of content</div>
      </div>
      <h1>Gradient Box</h1>
      <div className="Display-Box">
        <div
          className="Gradient Box"
          style={{ fontWeight: 650, fontSize: '24px' }}
        >
          I am a Gradient Box
        </div>
      </div>
      <h1>Rotated Container</h1>
      <div className="Display-Box">
        <div className="Rotated-Container" style={{ border: '1px solid red' }}>
          <div className="Card"> My Parent is Rotated but I am not</div>
        </div>
      </div>
      <h1>Card + Rotated Container + Gradient Box</h1>
      <div className="Display-Box">
        <div className="Rotated-Container Gradient Box">
          <div className="Card">Hello World!</div>
        </div>
      </div>
    </div>
  );
}

export default Catalogue;
