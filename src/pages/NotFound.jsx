import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-extrabold text-blue-500 mb-2">404</h1>
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl text-sm font-semibold border border-slate-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;