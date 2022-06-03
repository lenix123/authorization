import React from 'react';
import { createRoot } from 'react-dom/client';
import "./assets/css/index.css";
import { createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from "redux-thunk";
import rootReducer from './store/reducers';
import App from './App';

const store = createStore(rootReducer, compose(applyMiddleware(thunk)))

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <Provider store={store}>
        <App tab="home" />
    </Provider>
);
