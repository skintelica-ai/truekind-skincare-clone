import { Clock, Eye } from 'lucide-react';

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  readTime: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  author: {
    name: string;
    avatar: string | null;
  };
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  return (
    <div>
      <h2 className="font-display text-4xl mb-8 text-foreground">Related Articles</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <a
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group block"
          >
            <article className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:border-primary transition-all duration-300">
              {post.featuredImage && (
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h3 className="font-display text-2xl mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {post.author.avatar && (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span>{post.author.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.viewCount}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </a>
        ))}
      </div>
    </div>
  );
}