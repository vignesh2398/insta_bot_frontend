// src/store/loadingStore.js

let activeRequests = 0;
let listeners = [];

export const subscribeLoading = (callback) => {
  listeners.push(callback);

  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
};

const notify = () => {
  const loading = activeRequests > 0;
  listeners.forEach((listener) => listener(loading));
};

export const startLoading = () => {
  activeRequests++;
  notify();
};

export const stopLoading = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  notify();
};