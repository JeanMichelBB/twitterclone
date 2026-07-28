import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl, getAuthHeader } from '../../api';
import './Notifications.css';

type NotificationItem = {
    id: string;
    notification_type: string;
    actor: { id: string; username: string; full_name: string | null };
    tweet_id: string | null;
    date_created: string;
    read: boolean;
};

const verbFor = (type: string): string => {
    switch (type) {
        case 'Like':
            return 'liked your tweet';
        case 'Retweet':
            return 'retweeted your tweet';
        case 'Mention':
            return 'commented on your tweet';
        case 'Follow':
            return 'followed you';
        default:
            return 'interacted with you';
    }
};

const Notifications: React.FC = () => {
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await fetch(`${apiUrl}/notifications`, { headers: { ...getAuthHeader() } });
            const data = await res.json();
            setItems(data);
            setLoading(false);
        };
        load();
    }, []);

    const markRead = async (id: string) => {
        await fetch(`${apiUrl}/notifications/${id}/read`, {
            method: 'POST',
            headers: { ...getAuthHeader() },
        });
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    if (loading) return <div className="notifications-page">Loading...</div>;

    return (
        <div className="notifications-page">
            <h2 className="notifications-title">Notifications</h2>
            {items.length === 0 && <p className="notifications-empty">No notifications yet.</p>}
            {items.map((n) => (
                <div
                    key={n.id}
                    className={`notification-item ${n.read ? '' : 'notification-unread'}`}
                    onClick={() => !n.read && markRead(n.id)}
                >
                    <span className="notification-text">
                        <strong>{n.actor.full_name || n.actor.username}</strong> {verbFor(n.notification_type)}
                    </span>
                    {n.tweet_id && (
                        <Link to={`/status/${n.tweet_id}`} className="notification-link">
                            View
                        </Link>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Notifications;
