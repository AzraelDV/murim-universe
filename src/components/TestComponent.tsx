import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    }}>
      <div>
        <h1>Test Component Working!</h1>
        <p>If you can see this, React is working properly.</p>
      </div>
    </div>
  );
};

export default TestComponent; 