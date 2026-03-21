import React, { useEffect, useRef, useState } from 'react';
import './GifPicker.css';
import { apiUrl, getAuthHeader } from '../../api';

type GifResult = {
    id: string;
    url: string;
    thumbnail: string;
    title: string;
};

interface GifPickerProps {
    onSelect: (url: string) => void;
    onClose: () => void;
}

const GifPicker: React.FC<GifPickerProps> = ({ onSelect, onClose }) => {
    const [query, setQuery] = useState('');
    const [gifs, setGifs] = useState<GifResult[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchGifs = async (search = '') => {
        setLoading(true);
        try {
            const url = search
                ? `${apiUrl}/gifs?q=${encodeURIComponent(search)}`
                : `${apiUrl}/gifs`;
            const res = await fetch(url, { headers: { ...getAuthHeader() } });
            const data: GifResult[] = await res.json();
            setGifs(data);
        } catch (err) {
            console.error('GIF fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGifs();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchGifs(query);
    };

    return (
        <div className="gif-picker" ref={containerRef}>
            <div className="gif-picker-header">
                <form onSubmit={handleSearch} className="gif-search-form">
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search GIFs..."
                        autoFocus
                    />
                    <button type="submit">Search</button>
                </form>
                <button className="gif-picker-close" onClick={onClose}>✕</button>
            </div>
            <div className="gif-grid">
                {loading && <p className="gif-loading">Loading...</p>}
                {!loading && gifs.map(gif => (
                    <img
                        key={gif.id}
                        src={gif.thumbnail}
                        alt={gif.title}
                        onClick={() => { onSelect(gif.url); onClose(); }}
                    />
                ))}
            </div>
            <div className="gif-attribution">
                Powered by GIPHY
            </div>
        </div>
    );
};

export default GifPicker;
