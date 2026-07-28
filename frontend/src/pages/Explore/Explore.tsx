import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader/PageHeader';
import { apiUrl, getAuthHeader } from '../../api';
import './Explore.css';

type TrendingTweet = {
    id: string;
    user_id: string;
    content: string;
    image_url: string | null;
    num_likes: number;
    num_retweets: number;
};

const Explore: React.FC = () => {
    const [tweets, setTweets] = useState<TrendingTweet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await fetch(`${apiUrl}/tweets/trending`, { headers: { ...getAuthHeader() } });
            const data = await res.json();
            setTweets(Array.isArray(data) ? data : []);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className="page-container">
            <PageHeader title="Explore" />
            <div className="explore-body">
                {loading && <p className="explore-empty">Loading...</p>}
                {!loading && tweets.length === 0 && <p className="explore-empty">Nothing trending yet.</p>}
                {!loading && tweets.map((t) => (
                    <div key={t.id} className="explore-tweet">
                        <p>{t.content}</p>
                        <span className="explore-stats">{t.num_likes} likes · {t.num_retweets} retweets</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Explore;
