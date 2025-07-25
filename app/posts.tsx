import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [newTweet, setNewTweet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load posts
  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(setPosts)
      .catch(() => setError('Failed to load posts'));
  }, []);

  // Post a new tweet
  async function postTweet() {
    if (!newTweet.trim()) return;
    setLoading(true);
    setError('');

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newTweet.trim() }),
    });

    if (res.ok) {
      const created = await res.json();
      setPosts([created, ...posts]);
      setNewTweet('');
    } else {
      setError('Failed to post tweet');
    }
    setLoading(false);
  }

  // Delete post
  async function deletePost(id) {
    if (!confirm('Delete this post?')) return;

    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });

    if (res.ok) {
      setPosts(posts.filter(post => post.id !== id));
    } else {
      setError('Failed to delete post');
    }
  }

  if (status === 'loading') return <p>Loading...</p>;

  if (!session) {
    return (
      <main className="max-w-md mx-auto p-4">
        <p>Please <a href="/login" className="text-blue-600">log in</a> to see posts and tweet.</p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Mini Twitter</h1>
        <button
          onClick={() => signOut()}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >
          Log Out
        </button>
      </header>

      <section className="mb-6">
        <textarea
          value={newTweet}
          onChange={e => setNewTweet(e.target.value)}
          rows={3}
          placeholder="What's happening?"
          className="w-full border p-2 rounded resize-none"
        />
        <button
          onClick={postTweet}
          disabled={loading}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Tweet'}
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </section>

      <section>
        {posts.length === 0 && <p>No posts yet.</p>}
        <ul className="space-y-4">
          {posts.map(post => (
            <li
              key={post.id}
              className="border rounded p-3 relative"
            >
              <p>{post.content}</p>
              <small className="text-gray-600 block mt-2">
                By <strong>{post.authorName}</strong> on{' '}
                {new Date(post.createdAt).toLocaleString()}
              </small>
              {session.user.id === post.authorId && (
                <button
                  onClick={() => deletePost(post.id)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  ✖
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
