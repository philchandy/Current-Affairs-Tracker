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
    onEventClick: (country: string) => void;
    isEventCardOpen: boolean;
    
}

const Sidebar: React.FC<SidebarProps> = ({events, selectedCountry, setSelectedCountry, isOpen, toggleSidebar, onEventClick, isEventCardOpen}) => {

    const sidebarRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!isEventCardOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                toggleSidebar()
            }
        };

        if (isOpen && !isEventCardOpen) {
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
            className={`fixed top-0 left-0 h-full sm:w-full md:w-[400px] bg-gray-800 shadow-lg transition-transform duration-300 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ zIndex: 1001 }}
        >
            <div ref={sidebarRef} className="flex flex-col h-full ">
                {/* Sticky Header Section */}
                <div className="flex justify-between items-center bg-gray-800 p-4 sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-white tracking-wider">Events</h2>
                    <FaArrowLeft
                        size={24}
                        className="cursor-pointer text-white hover:text-gray-500"
                        onClick={toggleSidebar}
                    />
                </div>

                <div className="overflow-y-scroll no-scrollbar border-t-2 border-gray-600 px-2 pb-2 mb-2">
                    <ul>
                        {events.map((event, index) => (
                            <li
                                key={index}
                                data-country={event.country.toLowerCase()}
                                onClick={() => {
                                    setSelectedCountry(event.country.toLowerCase());
                                    onEventClick(event.country);
                                }}
                                className={`p-2 cursor-pointer text-white border-b border-gray-600 ${
                                    selectedCountry === event.country.toLowerCase() ? 'bg-gray-200/10' : ''
                                }`}
                            >
                                <h3 className='font-semibold'>{event.country}</h3>
                                <p>{event.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </>
    );
};

export default Sidebar;