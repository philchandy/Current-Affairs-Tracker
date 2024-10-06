import React, {useState, useEffect} from 'react';
import { FaTimes } from 'react-icons/fa';
import Draggable from 'react-draggable';

interface EventCardProps {
    country: string;
    description: string;
    detailedDescription: string;
    mediaScore: number;
    severityScore: number;
    normalizedDifference: number;
    onClose: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ country, description, detailedDescription, mediaScore, severityScore, onClose, normalizedDifference}) => {

    const [isDraggable, setIsDraggable] = useState(false);

    // Detect screen width to enable/disable draggable functionality
    useEffect(() => {
        const handleResize = () => {
            // Enable draggable only for medium screens and above (md and larger)
            setIsDraggable(window.innerWidth >= 768); // md is usually 768px and above
        };

        // Initial check
        handleResize();

        // Add event listener to track window resizing
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    const eventCardContent = (
        <div className={`fixed lg:top-20 lg:right-4 sm:top-0 sm:right-0 sm:h-full sm:w-full lg:h-[750px] lg:rounded-xl md:w-1/3 lg:w-1/4 bg-gray-800 text-white shadow-lg p-6 z-[1001]`}>
            <div className="header cursor-grab flex justify-between items-center mb-4 sticky top-0 bg-gray-800 z-10">
                <h2 className="text-2xl font-bold">{country}</h2>
                <button onClick={onClose} className="text-white hover:text-red-500">
                    <FaTimes size={24} />
                </button>
            </div>

            <div className="overflow-y-scroll md:no-scrollbar h-[calc(100%-60px)] pt-2 border-t-2 border-gray-600 z-[10000]">
                <div className="mb-4">
                    <p>{description}</p>
                </div>

                <div className="mb-4">
                    <h3 className="text-l font-semibold">Description</h3>
                    <p>{detailedDescription}</p>
                </div>

                <div className="mb-4">
                    <h3 className="text-l font-semibold">Severity Score</h3>
                    <p>{severityScore}</p>
                </div>

                <div className="mb-4">
                    <h3 className="text-l font-semibold">Media Score</h3>
                    <p>{mediaScore}</p>
                </div>

                <div>
                    <h3 className="text-l font-semibold">Normalized Difference</h3>
                    <p>{normalizedDifference}</p>
                </div>
            </div>
        </div>
    );

    // Conditionally wrap the event card in Draggable based on screen size
    return isDraggable ? (
        <Draggable handle=".header" bounds="parent" cancel=".no-drag">
            {eventCardContent}
        </Draggable>
    ) : (
        eventCardContent
    );
};

export default EventCard;