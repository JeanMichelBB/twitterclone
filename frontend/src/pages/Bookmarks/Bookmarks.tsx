import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader/PageHeader';
import { apiUrl, getAuthHeader } from '../../api';
import './Bookmarks.css';

type BookmarkedTweet = {
    id: string;
    user_id: string;
    content: string;
    image_url: string | null;
    date_posted: string;
    num_likes: number;
    num_retweets: number;
};

const Bookmarks: React.FC = () => {
    const [tweets, setTweets] = useState<BookmarkedTweet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await fetch(`${apiUrl}/bookmarks`, { headers: { ...getAuthHeader() } });
            const data = await res.json();
            setTweets(Array.isArray(data) ? data : []);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className="page-container">
            <PageHeader title="Bookmarks" />
            <div className="bookmarks-body">
                {loading && <p className="bookmarks-empty">Loading...</p>}
                {!loading && tweets.length === 0 && <p className="bookmarks-empty">You haven't bookmarked anything yet.</p>}
                {!loading && tweets.map((t) => (
                    <div key={t.id} className="bookmark-item">
                        <p>{t.content}</p>
                        {t.image_url && <img src={t.image_url} alt="" className="bookmark-image" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Bookmarks;
