'use client';

import { BlogPostEditor } from '@/components/admin/blog-post-editor';
import { useParams } from 'next/navigation';

export default function EditBlogPostPage() {
  const params = useParams();
  const postId = parseInt(params.id as string);

  return <BlogPostEditor postId={postId} />;
}