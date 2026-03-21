import './Trending.css';

const trends = [
    { category: 'Technology · Trending', topic: '#OpenSource', posts: '42.1K posts' },
    { category: 'Sports · Trending', topic: 'World Cup 2026', posts: '210K posts' },
    { category: 'Politics · Trending', topic: '#Election2026', posts: '98.4K posts' },
    { category: 'Science · Trending', topic: 'Mars Mission', posts: '31.7K posts' },
    { category: 'Entertainment · Trending', topic: '#Oscars', posts: '155K posts' },
];

const Trending = () => {
    return (
        <div className="trending">
            <h2 className="trending-title">What's happening</h2>
            {trends.map((trend, i) => (
                <div className="trend-item" key={i}>
                    <span className="trend-category">{trend.category}</span>
                    <span className="trend-topic">{trend.topic}</span>
                    <span className="trend-posts">{trend.posts}</span>
                </div>
            ))}
        </div>
    );
};

export default Trending;
