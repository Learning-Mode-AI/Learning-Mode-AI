import React, { useState } from 'react';

// Your React component
export function App() {
  const [counter, setCounter] = useState(0)
  return (
    <div style={{backgroundColor: 'white'}}>
      <h1>Hello from React!</h1>
      <p>{counter}</p>
      <button onClick={() => setCounter((c) => c+1)}>Click Me!</button>
    </div>
  );
}
