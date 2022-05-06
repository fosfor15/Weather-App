import React from 'react';
import ReactDOM from 'react-dom/client';

import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
Amplify.configure(awsExports);

import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
