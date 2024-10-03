import React, { useRef, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

interface Event {
    country: string,
    description: string,
    severityScore: any,
    mediaScore: any
}

interface SidebarProps {
    events: Event[],
    selectedCountry: string | null;
    setSelectedCountry: (country: string) => void;
    isOpen: boolean;
    toggleSidebar: () => void;
    
}

const Sidebar: React.FC<SidebarProps> = ({events, selectedCountry, setSelectedCountry, isOpen, toggleSidebar}) => {

    const sidebarRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                toggleSidebar()
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    },[isOpen, toggleSidebar])

    useEffect(()=>{
        if (selectedCountry && sidebarRef.current) {
            const element = sidebarRef.current.querySelector(`[data-country="${selectedCountry}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [selectedCountry]);

    return (
        <>
            {/* Hamburger Icon (when sidebar is closed) */}
            {!isOpen && (
                <div className="absolute top-4 left-4 z-[1000]">
                    <button
                    onClick={toggleSidebar}
                    className="flex flex-col justify-center items-center w-10 h-10 bg-gray-900/70 hover:bg-gray-500 rounded-md p-2"
                >
                    <span className="block w-6 h-[2px] bg-white mb-[4px]"></span>
                    <span className="block w-6 h-[2px] bg-white mb-[4px]"></span>
                    <span className="block w-6 h-[2px] bg-white"></span>
                </button>
                </div>
            )}

            <div
                className={`fixed top-0 left-0 h-full bg-gray-900 shadow-lg transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ width: '400px', maxHeight: '100%', overflowY: 'scroll', zIndex: 1001 }}
            >
                <div ref={sidebarRef} className="p-4" style={{ overflowY: 'scroll', scrollbarWidth: 'none' }}>
                    <style>{`
                        ::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>

                    <div className="flex justify-end mb-4">
                        <FaArrowLeft
                            size={24}
                            className="cursor-pointer text-white"
                            onClick={toggleSidebar}
                        />
                    </div>

                    <h2 className="text-xl font-bold text-white">Event List</h2>
                    <ul>
                        {events.map((event, index) => (
                            <li
                                key={index}
                                data-country={event.country.toLowerCase()}
                                onClick={() => {
                                    setSelectedCountry(event.country.toLowerCase());
                                }}
                                className={`p-2 cursor-pointer text-white ${selectedCountry === event.country.toLowerCase() ? 'bg-gray-200/10' : ''}`}
                            >
                                <h3>{event.country}</h3>
                                <p>{event.description}</p>
                                <p>Severity Score: {event.severityScore}</p>
                                <p>Media Score: {event.mediaScore}</p>
                                
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Sidebar;