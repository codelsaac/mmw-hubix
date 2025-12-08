import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

// Generate static params for all articles at build time
export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
    },
    select: {
      slug: true,
    },
  })
  
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

// Helper function to format article date (static for build-time safety)
function formatArticleDate(dateString: string | Date): string {
  // During build, return a static placeholder to avoid dynamic data access
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    return 'Date'
  }
  
  // In development or on client side, format the date properly
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString()
  } catch {
    return 'Invalid Date'
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Fetch article data directly from database
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })
    
    if (!article) {
      notFound()
    }
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Navigation */}
          <div className="flex items-center gap-4">
            <a href="/articles">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                ← Back to Articles
              </button>
            </a>
          </div>

          {/* Article Header */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center gap-2">
                {article.category && (
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    {article.category}
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
              {article.excerpt && (
                <p className="text-muted-foreground">{article.excerpt}</p>
              )}
            </div>
            <div className="p-6 pt-0">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  {formatArticleDate(article.publishedAt || article.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  {article.views} views
                </div>
                {article.creator && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    By {article.creator.name || article.creator.username}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching article:', error)
    notFound()
  }
}