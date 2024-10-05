import React from 'react';


const LoadingScreen: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="animate-spin h-16 w-16 border-8 border-gray-300 border-t-8 border-t-blue-500 rounded-full"></div>
            <h2 className="mt-4 text-2xl text-gray-700">Loading data...</h2>
        </div>
    );
};

export default LoadingScreen;