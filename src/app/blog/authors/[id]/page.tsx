import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Clock, Eye } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Author {
  id: number;
  userId: number;
  name: string;
  bio: string | null;
  avatar: string | null;
  socialLinks: any;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  readTime: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

async function getAuthor(id: string): Promise<Author | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/authors/${id}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.author;
  } catch (error) {
    console.error('Error fetching author:', error);
    return null;
  }
}

async function getAuthorPosts(authorId: string): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/posts?authorId=${authorId}&status=published`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.posts || [];
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const author = await getAuthor(params.id);
  
  if (!author) {
    return {
      title: 'Author Not Found',
      description: 'The requested author could not be found.'
    };
  }

  return {
    title: `${author.name} - TrueKind Skincare Journal`,
    description: author.bio || `Articles by ${author.name}`,
    openGraph: {
      title: `${author.name} - TrueKind Skincare`,
      description: author.bio || `Articles by ${author.name}`,
      images: author.avatar ? [author.avatar] : [],
    },
  };
}

export default async function AuthorPage({ params }: { params: { id: string } }) {
  const author = await getAuthor(params.id);
  
  if (!author) {
    notFound();
  }

  const posts = await getAuthorPosts(params.id);
  const socials = author.socialLinks || {};

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <nav className="container py-6">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
          <li>/</li>
          <li><a href="/blog" className="hover:text-foreground transition-colors">Journal</a></li>
          <li>/</li>
          <li><a href="/blog/authors" className="hover:text-foreground transition-colors">Authors</a></li>
          <li>/</li>
          <li className="text-foreground font-medium">{author.name}</li>
        </ol>
      </nav>

      {/* Author Profile */}
      <section className="container max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-secondary/30 to-muted/20 rounded-3xl p-12 mb-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {author.avatar && (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-32 h-32 rounded-full object-cover flex-shrink-0 border-4 border-background shadow-lg"
              />
            )}
            
            <div className="flex-1">
              <h1 className="font-display text-5xl font-light mb-4 text-foreground">
                {author.name}
              </h1>
              
              {author.bio && (
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {author.bio}
                </p>
              )}
              
              {(socials.twitter || socials.instagram || socials.linkedin || socials.website) && (
                <div className="flex flex-wrap gap-4">
                  {socials.twitter && (
                    <a
                      href={socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Twitter
                    </a>
                  )}
                  {socials.instagram && (
                    <a
                      href={socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Instagram
                    </a>
                  )}
                  {socials.linkedin && (
                    <a
                      href={socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      LinkedIn
                    </a>
                  )}
                  {socials.website && (
                    <a
                      href={socials.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Author's Posts */}
        <div>
          <h2 className="font-display text-4xl mb-8 text-foreground">
            Articles by {author.name} ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No published articles yet.</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <article className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:border-primary transition-all duration-300 flex flex-col md:flex-row">
                    {post.featuredImage && (
                      <div className="md:w-1/3 aspect-[4/3] md:aspect-auto overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.categories.map((category) => (
                          <span
                            key={category.id}
                            className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                      
                      <h3 className="font-display text-3xl mb-3 text-foreground group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime} min read
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.viewCount} views
                        </span>
                        <span>
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </article>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}