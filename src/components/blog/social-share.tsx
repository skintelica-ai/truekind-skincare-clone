'use client';

import { Facebook, Twitter, Linkedin, Link2, Mail } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  description: string;
}

export function SocialShare({ url, title, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url)}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShare = (platform: string, link: string) => {
    window.open(link, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground mr-2">Share:</span>
      
      <button
        onClick={() => handleShare('twitter', shareLinks.twitter)}
        className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => handleShare('facebook', shareLinks.facebook)}
        className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => handleShare('linkedin', shareLinks.linkedin)}
        className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </button>
      
      <a
        href={shareLinks.email}
        className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
        aria-label="Share via Email"
      >
        <Mail className="w-4 h-4" />
      </a>
      
      <button
        onClick={handleCopyLink}
        className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors relative"
        aria-label="Copy link"
      >
        <Link2 className="w-4 h-4" />
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
            Copied!
          </span>
        )}
      </button>
    </div>
  );
}