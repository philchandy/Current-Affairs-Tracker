import React from 'react';
import { FaGithub, FaLink, FaArrowDown } from 'react-icons/fa'

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const Drawer: React.FC<DrawerProps> = ({isOpen, onClose}) => {
    return (
        <div className={`fixed inset-0 z-[1001] bg-gray-800 transition-transform transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} shadow-lg`}>
            <div className="h-full p-4 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 flex flex-row gap-2 justify-center items-center">
                    <h2 className='text-white'>Close</h2>
                    <FaArrowDown className="text-xl" style={{color: "#ffffff"}} />
                </button>
                <h2 className="text-2xl font-bold">About This App</h2>
                <p className="mt-2">
                    This application provides real-time information about current events around the world, using various data sources to assess severity and media attention.
                </p>
            </div>
        </div>
    );
}

export default Drawer;