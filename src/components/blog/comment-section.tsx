'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp } from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  authorName: string;
  authorEmail: string;
  status: string;
  likes: number;
  createdAt: string;
  replies: Comment[];
}

interface CommentSectionProps {
  postId: number;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState({
    authorName: '',
    authorEmail: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/blog/comments?postId=${postId}&status=approved`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.authorName || !newComment.authorEmail || !newComment.content) {
      setMessage('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newComment,
          postId,
          status: 'pending'
        })
      });

      if (res.ok) {
        setMessage('Your comment has been submitted and is awaiting moderation.');
        setNewComment({ authorName: '', authorEmail: '', content: '' });
      } else {
        setMessage('Failed to submit comment. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-4xl mb-8 text-foreground flex items-center gap-3">
        <MessageCircle className="w-8 h-8" />
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <div className="bg-secondary/30 rounded-2xl p-8 mb-12 border border-border">
        <h3 className="font-display text-2xl mb-6">Leave a Comment</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your Name"
              value={newComment.authorName}
              onChange={(e) => setNewComment({ ...newComment, authorName: e.target.value })}
              className="px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={newComment.authorEmail}
              onChange={(e) => setNewComment({ ...newComment, authorEmail: e.target.value })}
              className="px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          <textarea
            placeholder="Your Comment"
            value={newComment.content}
            onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            required
          />
          
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-foreground text-background rounded-full font-medium hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Comment'}
          </button>
          
          {message && (
            <p className={`text-sm ${message.includes('submitted') ? 'text-green-600' : 'text-destructive'}`}>
              {message}
            </p>
          )}
        </form>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-foreground">{comment.authorName}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  {comment.likes}
                </button>
              </div>
              
              <p className="text-foreground leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}