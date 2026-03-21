// src/components/TweetList/TweetList.tsx
import React, { useState, useEffect } from 'react';
import User from '../../UserModel';
import './TweetList.css';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl, getAuthHeader } from '../../api';
import { FaHeart, FaRetweet, FaRegComment } from 'react-icons/fa';
import { faker } from '@faker-js/faker';

type Tweet = {
    id: string;
    user_id: string;
    content: string;
    image_url?: string | null;
    date_posted: string;
    num_likes: number;
    num_retweets: number;
    num_comments: number;
    retweeted_by_user_id?: string | null;
};

type Comment = {
    id: string;
    user_id: string;
    tweet_id: string;
    content: string;
    date_posted: string;
    num_likes: number;
    username: string;
    full_name: string;
    profile_picture: string;
};

interface TweetListProps {
    user: User;
    refresh: boolean;  // Add this line to accept the refresh prop
}

const TweetList: React.FC<TweetListProps> = ({ user, refresh }) => {
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [users, setUsers] = useState<{ [key: string]: User }>({});
    const [userLikes, setUserLikes] = useState<{ [key: string]: boolean }>({});
    const [userRetweets, setUserRetweets] = useState<{ [key: string]: boolean }>({});
    const [overlayTweet, setOverlayTweet] = useState<Tweet | null>(null);
    const [overlayComments, setOverlayComments] = useState<Comment[]>([]);
    const [overlayCommentLikes, setOverlayCommentLikes] = useState<{ [key: string]: boolean }>({});
    const [overlayNewComment, setOverlayNewComment] = useState('');
    const [overlaySuggestions, setOverlaySuggestions] = useState<string[]>([]);
    const [overlayShowSuggestions, setOverlayShowSuggestions] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!overlayTweet) return;
        const fetchOverlayComments = async () => {
            const [commentsRes, likesRes] = await Promise.all([
                fetch(`${apiUrl}/tweets/${overlayTweet.id}/comments`, { headers: { ...getAuthHeader() } }),
                fetch(`${apiUrl}/comments/likes/${user.id}`, { headers: { ...getAuthHeader() } }),
            ]);
            if (commentsRes.ok) setOverlayComments(await commentsRes.json());
            if (likesRes.ok) {
                const data = await likesRes.json();
                const map: { [key: string]: boolean } = {};
                data.forEach((l: any) => { map[l.comment_id] = true; });
                setOverlayCommentLikes(map);
            }
        };
        const suggestions: string[] = [];
        for (let i = 0; i < 5; i++) suggestions.push(faker.lorem.sentence());
        setOverlaySuggestions(suggestions);
        setOverlayNewComment('');
        setOverlayShowSuggestions(false);
        fetchOverlayComments();
    }, [overlayTweet?.id]);

    const handleLike = async (tweetId: string) => {
        try {
            const alreadyLiked = userLikes[tweetId];
    
            if (alreadyLiked) {
                await fetch(`${apiUrl}/tweets/unlike?user_id=${user.id}&tweet_id=${tweetId}`, {
                    method: 'POST',
                    headers: {
                        ...getAuthHeader(),
                        'Accept': 'application/json'
                    }
                });
    
                // Decrement num_likes by one
                setTweets(prevTweets => prevTweets.map(tweet => {
                    if (tweet.id === tweetId) {
                        return {
                            ...tweet,
                            num_likes: tweet.num_likes - 1
                        };
                    }
                    return tweet;
                }));
    
                setUserLikes(prevUserLikes => ({ ...prevUserLikes, [tweetId]: false }));
                setOverlayTweet(prev => prev?.id === tweetId ? { ...prev, num_likes: prev.num_likes - 1 } : prev);
            } else {
                await fetch(`${apiUrl}/tweets/like?user_id=${user.id}&tweet_id=${tweetId}`, {
                    method: 'POST',
                    headers: {
                        ...getAuthHeader(),
                        'Accept': 'application/json'
                    }
                });
    
                // Increment num_likes by one
                setTweets(prevTweets => prevTweets.map(tweet => {
                    if (tweet.id === tweetId) {
                        return {
                            ...tweet,
                            num_likes: tweet.num_likes + 1
                        };
                    }
                    return tweet;
                }));
    
                setUserLikes(prevUserLikes => ({ ...prevUserLikes, [tweetId]: true }));
                setOverlayTweet(prev => prev?.id === tweetId ? { ...prev, num_likes: prev.num_likes + 1 } : prev);
            }
        } catch (error) {
            console.error('Error handling like:', error);
        }
    };
    

    const handleRetweet = async (tweetId: string) => {
        try {
            const alreadyRetweeted = userRetweets[tweetId];
            const endpoint = alreadyRetweeted ? 'unretweet' : 'retweet';
            await fetch(`${apiUrl}/tweets/${endpoint}?user_id=${user.id}&tweet_id=${tweetId}`, {
                method: 'POST',
                headers: { ...getAuthHeader(), 'Accept': 'application/json' }
            });
            setTweets(prev => prev.map(t => t.id === tweetId
                ? { ...t, num_retweets: t.num_retweets + (alreadyRetweeted ? -1 : 1) }
                : t
            ));
            setUserRetweets(prev => ({ ...prev, [tweetId]: !alreadyRetweeted }));
            setOverlayTweet(prev => prev?.id === tweetId ? { ...prev, num_retweets: prev.num_retweets + (alreadyRetweeted ? -1 : 1) } : prev);
        } catch (error) {
            console.error('Error handling retweet:', error);
        }
    };

    const handleOverlayCommentLike = async (commentId: string) => {
        const alreadyLiked = overlayCommentLikes[commentId];
        const endpoint = alreadyLiked ? 'unlike' : 'like';
        await fetch(`${apiUrl}/comments/${endpoint}?user_id=${user.id}&comment_id=${commentId}`, {
            method: 'POST',
            headers: { ...getAuthHeader(), 'Accept': 'application/json' },
        });
        setOverlayComments(prev => prev.map(c => c.id === commentId
            ? { ...c, num_likes: c.num_likes + (alreadyLiked ? -1 : 1) }
            : c
        ));
        setOverlayCommentLikes(prev => ({ ...prev, [commentId]: !alreadyLiked }));
    };

    const handleOverlaySubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!overlayNewComment.trim() || !overlayTweet) return;
        const res = await fetch(`${apiUrl}/tweets/${overlayTweet.id}/comments`, {
            method: 'POST',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, content: overlayNewComment }),
        });
        if (res.ok) {
            const comment: Comment = await res.json();
            setOverlayComments(prev => [...prev, comment]);
            setOverlayTweet(prev => prev ? { ...prev, num_comments: prev.num_comments + 1 } : prev);
            setTweets(prev => prev.map(t => t.id === overlayTweet.id ? { ...t, num_comments: t.num_comments + 1 } : t));
            setOverlayNewComment('');
            const fresh: string[] = [];
            for (let i = 0; i < 5; i++) fresh.push(faker.lorem.sentence());
            setOverlaySuggestions(fresh);
        }
    };

    useEffect(() => {
        const fetchTweets = async () => {
            try {
                const response = await fetch(`${apiUrl}/tweets`, {
                    headers: { ...getAuthHeader() }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch tweets');
                }
                const data = await response.json();
                // Sort tweets by date_posted in descending order
                const sortedTweets = data.sort((a: Tweet, b: Tweet) => new Date(b.date_posted).getTime() - new Date(a.date_posted).getTime());
                setTweets(sortedTweets);
            } catch (error) {
                console.error('Error fetching tweets:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await fetch(`${apiUrl}/users`, {
                    headers: { ...getAuthHeader() }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                const usersMap: { [key: string]: User } = {};
                data.forEach((user: User) => {
                    usersMap[user.id] = user;
                });
                setUsers(usersMap);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const checkUserLikes = async () => {
            try {
                const response = await fetch(`${apiUrl}/tweets/likes/${user.id}`, {
                    headers: { ...getAuthHeader() }
                });
                if (!response.ok) {
                    throw new Error('Failed to check user likes');
                }
                const data = await response.json();
                const userLikes: { [key: string]: boolean } = {};
                data.forEach((like: any) => {
                    userLikes[like.tweet_id] = true;
                });
                setUserLikes(userLikes);
            } catch (error) {
                console.error('Error checking user likes:', error);
            }
        };

        const checkUserRetweets = async () => {
            try {
                const response = await fetch(`${apiUrl}/tweets/retweets/${user.id}`, {
                    headers: { ...getAuthHeader() }
                });
                if (!response.ok) return;
                const data = await response.json();
                const map: { [key: string]: boolean } = {};
                data.forEach((r: any) => { map[r.tweet_id] = true; });
                setUserRetweets(map);
            } catch (error) {
                console.error('Error checking user retweets:', error);
            }
        };

        checkUserLikes();
        checkUserRetweets();
        fetchUsers();
        fetchTweets();
    }, [refresh]);  // Add refresh to the dependency array

    return (
        <>
        <div className="tweet-list-container">
            <ul>
                {tweets.map((tweet) => (
                    <li key={tweet.retweeted_by_user_id ? `${tweet.id}-rt-${tweet.retweeted_by_user_id}` : tweet.id} className="tweet-item" onClick={() => navigate(`/status/${tweet.id}`)} style={{ cursor: 'pointer' }}>
                        {tweet.retweeted_by_user_id && (
                            <div className="retweet-label">
                                <FaRetweet size={12} /> {users[tweet.retweeted_by_user_id]?.username || 'Someone'} retweeted
                            </div>
                        )}
                        <div className="tweet-item-body">
                        <Link to={`/${users[tweet.user_id]?.username}`} className="tweet-link">
                            <img
                                src={users[tweet.user_id]?.profile_picture || 'https://via.placeholder.com/150'}
                                alt={`${users[tweet.user_id]?.username || 'Unknown'}'s profile`}
                                className="profile-picture"
                            />
                        </Link>
                        <div className="tweet-details">
                            <Link to={`/${users[tweet.user_id]?.username}`} className="tweet-link">
                                <div className="tweet-info">
                                    <span className="tweet-user">{users[tweet.user_id]?.full_name || 'Unknown'}</span>
                                    <span className="tweet-username">@{users[tweet.user_id]?.username || 'Unknown'}</span>
                                    <span className="tweet-date">{new Date(tweet.date_posted).toLocaleString()}</span>
                                </div>
                            </Link>
                            <div className="tweet-content">
                                {tweet.content}
                                {tweet.image_url && (
                                    <img src={tweet.image_url} alt="tweet" className="tweet-image" onClick={(e) => { e.stopPropagation(); setOverlayTweet(tweet); }} />
                                )}
                            </div>
                            <div className="tweet-actions">
                                <button onClick={(e) => { e.stopPropagation(); navigate(`/status/${tweet.id}`); }}>
                                    <FaRegComment /> {tweet.num_comments}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleRetweet(tweet.id); }} style={{ color: userRetweets[tweet.id] ? '#17bf63' : undefined }}>
                                    <FaRetweet /> {tweet.num_retweets}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleLike(tweet.id); }} style={{ color: userLikes[tweet.id] ? '#e0245e' : undefined }}>
                                    <FaHeart /> {tweet.num_likes}
                                </button>
                            </div>
                        </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        {overlayTweet && (
            <div className="image-overlay-backdrop" onClick={() => setOverlayTweet(null)}>
                <div className="image-overlay" onClick={(e) => e.stopPropagation()}>
                    <div className="image-overlay-left">
                        <img src={overlayTweet.image_url!} alt="tweet full" />
                    </div>
                    <div className="image-overlay-right">
                        <button className="overlay-close" onClick={() => setOverlayTweet(null)}>✕</button>
                        <Link to={`/${users[overlayTweet.user_id]?.username}`} className="tweet-link" onClick={() => setOverlayTweet(null)}>
                            <div className="overlay-user-info">
                                <img src={users[overlayTweet.user_id]?.profile_picture || 'https://via.placeholder.com/150'} alt="profile" className="profile-picture" />
                                <div>
                                    <span className="tweet-user">{users[overlayTweet.user_id]?.full_name || 'Unknown'}</span>
                                    <span className="tweet-username">@{users[overlayTweet.user_id]?.username || 'Unknown'}</span>
                                </div>
                            </div>
                        </Link>
                        <p className="overlay-content">{overlayTweet.content}</p>
                        <span className="overlay-date">{new Date(overlayTweet.date_posted).toLocaleString()}</span>
                        <div className="overlay-actions">
                            <button onClick={() => handleLike(overlayTweet.id)} style={{ color: userLikes[overlayTweet.id] ? '#e0245e' : undefined }}>
                                <FaHeart /> {overlayTweet.num_likes}
                            </button>
                            <button onClick={() => handleRetweet(overlayTweet.id)} style={{ color: userRetweets[overlayTweet.id] ? '#17bf63' : undefined }}>
                                <FaRetweet /> {overlayTweet.num_retweets}
                            </button>
                            <span style={{ color: '#888', fontSize: '0.85em' }}>
                                <FaRegComment /> {overlayTweet.num_comments}
                            </span>
                        </div>

                        <div className="overlay-comments">
                            <form className="overlay-comment-form" onSubmit={handleOverlaySubmitComment}>
                                <img src={user.profile_picture} alt="you" className="profile-picture" />
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <textarea
                                        value={overlayNewComment}
                                        readOnly
                                        placeholder="Post your reply"
                                        rows={2}
                                        onFocus={() => setOverlayShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setOverlayShowSuggestions(false), 150)}
                                    />
                                    {overlayShowSuggestions && (
                                        <div className="suggestions-box">
                                            <ul>
                                                {overlaySuggestions.map((s, i) => (
                                                    <li key={i} onClick={() => { setOverlayNewComment(s); setOverlayShowSuggestions(false); }}>{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <button type="submit" disabled={!overlayNewComment.trim()}>Reply</button>
                            </form>

                            {overlayComments.map(comment => (
                                <div className="overlay-comment-item" key={comment.id}>
                                    <img src={comment.profile_picture} alt="profile" className="profile-picture" />
                                    <div className="overlay-comment-body">
                                        <div className="overlay-comment-header">
                                            <span className="tweet-user">{comment.full_name}</span>
                                            <span className="tweet-username">@{comment.username}</span>
                                        </div>
                                        <p className="overlay-comment-content">{comment.content}</p>
                                        <button
                                            className="overlay-comment-like"
                                            onClick={() => handleOverlayCommentLike(comment.id)}
                                            style={{ color: overlayCommentLikes[comment.id] ? '#e0245e' : '#888' }}
                                        >
                                            <FaHeart /> {comment.num_likes}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default TweetList;
