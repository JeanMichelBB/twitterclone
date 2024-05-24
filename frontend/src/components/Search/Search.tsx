import React, { useState, useEffect, useRef } from 'react';
import './Search.css';

interface User {
    id: string;
    username: string;
    email: string;
    full_name: string;
    profile_picture: string;
    bio: string;
    location: string;
    website: string;
    date_joined: string;
}

const Search = () => {
    const [username, setUsername] = useState('');
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState<User[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        // Fetch users when the component mounts
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://10.0.0.55:8000/users', {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                const users: User[] = await response.json();
                setSuggestions(users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUsername(value);

        // Filter suggestions based on the input value
        const filtered = suggestions.filter(user =>
            user.username.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(true);
        setHighlightedIndex(-1);
    };

    const handleSubmit = () => {
        if (highlightedIndex >= 0 && filteredSuggestions.length > 0) {
            handleSuggestionClick(filteredSuggestions[highlightedIndex].username);
        } else if (username.trim()) {
            window.location.href = `/${username}`;
        }
    };

    const handleSuggestionClick = (username: string) => {
        setUsername(username);
        setFilteredSuggestions([]);
        setShowSuggestions(false);
        window.location.href = `/${username}`;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            setHighlightedIndex(prevIndex =>
                prevIndex < filteredSuggestions.length - 1 ? prevIndex + 1 : prevIndex
            );
        } else if (e.key === 'ArrowUp') {
            setHighlightedIndex(prevIndex =>
                prevIndex > 0 ? prevIndex - 1 : prevIndex
            );
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            inputRef.current && !inputRef.current.contains(event.target as Node) &&
            suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
        ) {
            setShowSuggestions(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="search-container">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <input
                    type="text"
                    placeholder="Search"
                    value={username}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    ref={inputRef}
                />
            </form>
            {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="suggestions-list" ref={suggestionsRef}>
                    {filteredSuggestions.map((user, index) => (
                        <li
                            key={user.id}
                            onClick={() => handleSuggestionClick(user.username)}
                            className={highlightedIndex === index ? 'highlighted' : ''}
                        >
                            {user.username}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Search;
