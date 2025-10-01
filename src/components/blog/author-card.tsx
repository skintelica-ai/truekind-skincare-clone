interface AuthorCardProps {
  author: {
    id: number;
    name: string;
    bio: string | null;
    avatar: string | null;
    socialLinks: any;
  };
}

export function AuthorCard({ author }: AuthorCardProps) {
  const socials = author.socialLinks || {};

  return (
    <div className="bg-secondary/30 rounded-2xl p-8 border border-border">
      <div className="flex gap-6 items-start">
        {author.avatar && (
          <img
            src={author.avatar}
            alt={author.name}
            className="w-24 h-24 rounded-full object-cover flex-shrink-0"
          />
        )}
        
        <div className="flex-1">
          <h3 className="font-display text-3xl mb-2 text-foreground">
            About {author.name}
          </h3>
          
          {author.bio && (
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {author.bio}
            </p>
          )}
          
          {(socials.twitter || socials.instagram || socials.linkedin) && (
            <div className="flex gap-4">
              {socials.twitter && (
                <a
                  href={socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Twitter
                </a>
              )}
              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Instagram
                </a>
              )}
              {socials.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}