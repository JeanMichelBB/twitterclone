import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import User from '../../UserModel';
import { apiUrl, getAuthHeader } from '../../api';
import { FaHeart, FaRetweet, FaRegComment } from 'react-icons/fa';
import { faker } from '@faker-js/faker';
import './Status.css';

type Tweet = {
    id: string;
    user_id: string;
    content: string;
    image_url?: string | null;
    date_posted: string;
    num_likes: number;
    num_retweets: number;
    num_comments: number;
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

interface StatusProps {
    user: User;
}

const Status: React.FC<StatusProps> = ({ user }) => {
    const { tweetId } = useParams<{ tweetId: string }>();
    const navigate = useNavigate();
    const [tweet, setTweet] = useState<Tweet | null>(null);
    const [author, setAuthor] = useState<User | null>(null);
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentLikes, setCommentLikes] = useState<{ [key: string]: boolean }>({});
    const [newComment, setNewComment] = useState('');
    const [commentSuggestions, setCommentSuggestions] = useState<string[]>([]);
    const [showCommentSuggestions, setShowCommentSuggestions] = useState(false);
    const commentFormRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const suggestions: string[] = [];
        for (let i = 0; i < 5; i++) suggestions.push(faker.lorem.sentence());
        setCommentSuggestions(suggestions);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (commentFormRef.current && !commentFormRef.current.contains(e.target as Node)) {
                setShowCommentSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await fetch(`${apiUrl}/tweet/${tweetId}`, { headers: { ...getAuthHeader() } });
                if (!res.ok) return;
                const data: Tweet = await res.json();
                setTweet(data);

                const usersRes = await fetch(`${apiUrl}/users`, { headers: { ...getAuthHeader() } });
                const users: User[] = await usersRes.json();
                const found = users.find(u => u.id === data.user_id);
                if (found) setAuthor(found);

                const likesRes = await fetch(`${apiUrl}/tweets/likes/${user.id}`, { headers: { ...getAuthHeader() } });
                const likes = await likesRes.json();
                setLiked(likes.some((l: any) => l.tweet_id === data.id));

                const commentsRes = await fetch(`${apiUrl}/tweets/${tweetId}/comments`, { headers: { ...getAuthHeader() } });
                const commentsData: Comment[] = await commentsRes.json();
                setComments(commentsData);

                const commentLikesRes = await fetch(`${apiUrl}/comments/likes/${user.id}`, { headers: { ...getAuthHeader() } });
                const commentLikesData = await commentLikesRes.json();
                const map: { [key: string]: boolean } = {};
                commentLikesData.forEach((l: any) => { map[l.comment_id] = true; });
                setCommentLikes(map);
            } catch (err) {
                console.error('Error fetching tweet:', err);
            }
        };
        fetchAll();
    }, [tweetId]);

    const handleLike = async () => {
        if (!tweet) return;
        const endpoint = liked ? 'unlike' : 'like';
        await fetch(`${apiUrl}/tweets/${endpoint}?user_id=${user.id}&tweet_id=${tweet.id}`, {
            method: 'POST',
            headers: { ...getAuthHeader(), 'Accept': 'application/json' },
        });
        setLiked(!liked);
        setTweet(prev => prev ? { ...prev, num_likes: prev.num_likes + (liked ? -1 : 1) } : prev);
    };

    const handleCommentLike = async (commentId: string) => {
        const alreadyLiked = commentLikes[commentId];
        const endpoint = alreadyLiked ? 'unlike' : 'like';
        await fetch(`${apiUrl}/comments/${endpoint}?user_id=${user.id}&comment_id=${commentId}`, {
            method: 'POST',
            headers: { ...getAuthHeader(), 'Accept': 'application/json' },
        });
        setComments(prev => prev.map(c => c.id === commentId
            ? { ...c, num_likes: c.num_likes + (alreadyLiked ? -1 : 1) }
            : c
        ));
        setCommentLikes(prev => ({ ...prev, [commentId]: !alreadyLiked }));
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        const res = await fetch(`${apiUrl}/tweets/${tweetId}/comments`, {
            method: 'POST',
            headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, content: newComment }),
        });
        if (res.ok) {
            const comment: Comment = await res.json();
            setComments(prev => [...prev, comment]);
            setTweet(prev => prev ? { ...prev, num_comments: prev.num_comments + 1 } : prev);
            setNewComment('');
            const fresh: string[] = [];
            for (let i = 0; i < 5; i++) fresh.push(faker.lorem.sentence());
            setCommentSuggestions(fresh);
        }
    };

    return (
        <div className="status-page">
            <div className="status-header">
                <button className="status-back" onClick={() => navigate(-1)}>&#8592;</button>
                <h2>Post</h2>
            </div>

            {tweet && (
                <>
                <div className="tweet-list-container">
                    <ul>
                        <li className="tweet-item">
                            <div className="tweet-item-body">
                            <Link to={`/${author?.username}`} className="tweet-link">
                                <img src={author?.profile_picture || 'https://via.placeholder.com/150'} alt="profile" className="profile-picture" />
                            </Link>
                            <div className="tweet-details">
                                <Link to={`/${author?.username}`} className="tweet-link">
                                    <div className="tweet-info">
                                        <span className="tweet-user">{author?.full_name || 'Unknown'}</span>
                                        <span className="tweet-username">@{author?.username || 'Unknown'}</span>
                                        <span className="tweet-date">{new Date(tweet.date_posted).toLocaleString()}</span>
                                    </div>
                                </Link>
                                <div className="tweet-content">
                                    {tweet.content}
                                    {tweet.image_url && <img src={tweet.image_url} alt="tweet" className="tweet-image" />}
                                </div>
                                <div className="tweet-actions">
                                    <button><FaRegComment /> {tweet.num_comments}</button>
                                    <button><FaRetweet /> {tweet.num_retweets}</button>
                                    <button onClick={handleLike} style={{ color: liked ? '#e0245e' : undefined }}>
                                        <FaHeart /> {tweet.num_likes}
                                    </button>
                                </div>
                            </div>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="status-comments">
                    <form className="comment-form" ref={commentFormRef} onSubmit={handleSubmitComment}>
                        <img src={user.profile_picture} alt="you" className="profile-picture" />
                        <div style={{ flex: 1, position: 'relative' }}>
                            <textarea
                                value={newComment}
                                placeholder="Post your reply"
                                readOnly
                                rows={2}
                                onFocus={() => setShowCommentSuggestions(true)}
                            />
                            {showCommentSuggestions && (
                                <div className="suggestions-box">
                                    <ul>
                                        {commentSuggestions.map((s, i) => (
                                            <li key={i} onClick={() => {
                                                setNewComment(s);
                                                setShowCommentSuggestions(false);
                                            }}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <button type="submit" disabled={!newComment.trim()}>Reply</button>
                    </form>

                    {comments.map(comment => (
                        <div className="comment-item" key={comment.id}>
                            <Link to={`/${comment.username}`}>
                                <img src={comment.profile_picture} alt="profile" className="profile-picture" />
                            </Link>
                            <div className="comment-body">
                                <div className="comment-header">
                                    <span className="tweet-user">{comment.full_name}</span>
                                    <span className="tweet-username">@{comment.username}</span>
                                    <span className="tweet-date">{new Date(comment.date_posted).toLocaleString()}</span>
                                </div>
                                <p className="comment-content">{comment.content}</p>
                                <div className="comment-actions">
                                    <button onClick={() => handleCommentLike(comment.id)} style={{ color: commentLikes[comment.id] ? '#e0245e' : undefined }}>
                                        <FaHeart /> {comment.num_likes}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                </>
            )}
        </div>
    );
};

export default Status;
