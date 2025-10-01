import { db } from '@/db';
import { blogPosts, blogCategories, user } from '@/db/schema';

async function main() {
    // First, get existing category IDs and author IDs
    const categories = await db.select().from(blogCategories).limit(3);
    const authors = await db.select().from(user).limit(3);
    
    if (categories.length === 0 || authors.length === 0) {
        throw new Error('Please seed blog categories and users first');
    }

    const sampleBlogPosts = [
        {
            title: 'The Ultimate Anti-Aging Skincare Routine for Your 30s and Beyond',
            slug: 'ultimate-anti-aging-skincare-routine-30s-beyond',
            excerpt: 'Discover the essential steps and premium ingredients that will transform your skin and slow down the aging process with our expertly curated routine.',
            content: `<h2>Why Your 30s Are the Perfect Time to Start</h2>
            <p>Your thirties mark a pivotal moment in skincare. Collagen production begins to slow, fine lines may start appearing, and your skin's natural renewal process becomes less efficient. But here's the good news: it's never too late to start an effective anti-aging routine that will keep your skin looking radiant and youthful.</p>
            
            <h2>The Essential Morning Routine</h2>
            <p>Start your day with a gentle cleanser to remove overnight impurities, followed by a vitamin C serum to protect against environmental damage. Apply a hydrating moisturizer with SPF 30 or higher – this is non-negotiable for preventing premature aging. The key is consistency and using products formulated with clinically-proven ingredients like retinyl palmitate and peptides.</p>
            
            <h2>Evening Recovery Protocol</h2>
            <p>Your evening routine is where the real magic happens. After cleansing, apply a retinol serum 2-3 times per week, gradually increasing frequency as your skin adapts. Follow with a rich night cream containing ceramides and hyaluronic acid to support your skin's natural repair process while you sleep. Remember, patience is key – visible results typically appear after 12-16 weeks of consistent use.</p>`,
            featuredImage: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=600&fit=crop',
            featuredImageAlt: 'Luxury skincare products arranged on marble surface',
            authorId: authors[0].id,
            categoryId: categories[0].id,
            status: 'published',
            publishedAt: new Date('2024-01-15T10:00:00Z').getTime(),
            updatedAt: new Date('2024-01-15T10:00:00Z').getTime(),
            readTime: 6,
            viewCount: 2847,
            shareCount: 156,
            metaTitle: 'Ultimate Anti-Aging Skincare Routine for 30s+ | Expert Guide',
            metaDescription: 'Transform your skin with our expert anti-aging routine for 30s and beyond. Discover proven ingredients and essential steps for youthful, radiant skin.',
            focusKeyword: 'anti-aging skincare routine',
            seoScore: 85,
            createdAt: new Date('2024-01-15T10:00:00Z').getTime(),
        },
        {
            title: 'Hydration Heroes: 5 Game-Changing Ingredients for Dewy Skin',
            slug: 'hydration-heroes-ingredients-dewy-skin',
            excerpt: 'Unlock the secrets to perfectly hydrated skin with these five powerhouse ingredients that will transform dry, dull skin into a radiant, dewy complexion.',
            content: `<h2>The Science of Skin Hydration</h2>
            <p>Achieving that coveted dewy glow isn't just about drinking more water. Your skin's hydration depends on its ability to attract, retain, and maintain moisture at the cellular level. Understanding how different ingredients work synergistically can help you build a routine that delivers lasting hydration and that healthy, lit-from-within radiance.</p>
            
            <h2>Hyaluronic Acid: The Ultimate Moisture Magnet</h2>
            <p>This superstar ingredient can hold up to 1,000 times its weight in water, making it the gold standard for hydration. Look for serums with multiple molecular weights of hyaluronic acid – smaller molecules penetrate deeper while larger ones create a moisture barrier on the surface. Apply to damp skin for maximum absorption and follow with a moisturizer to seal in the benefits.</p>
            
            <h2>Beyond the Basics: Advanced Hydrating Compounds</h2>
            <p>Ceramides restore your skin's natural barrier, preventing water loss throughout the day. Glycerin acts as a humectant, drawing moisture from the environment to your skin. Sodium PCA, naturally found in healthy skin, helps maintain optimal hydration levels. When combined with peptides and niacinamide, these ingredients create a comprehensive hydration system that works around the clock to keep your skin plump, smooth, and luminous.</p>`,
            featuredImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=600&fit=crop',
            featuredImageAlt: 'Hydrating serum droplets on dewy skin close-up',
            authorId: authors[1].id,
            categoryId: categories[1].id,
            status: 'published',
            publishedAt: new Date('2024-01-22T14:30:00Z').getTime(),
            updatedAt: new Date('2024-01-22T14:30:00Z').getTime(),
            readTime: 5,
            viewCount: 1923,
            shareCount: 89,
            metaTitle: 'Top 5 Hydrating Skincare Ingredients for Dewy Skin | Expert Guide',
            metaDescription: 'Discover the 5 most effective hydrating ingredients for achieving dewy, radiant skin. Expert tips on hyaluronic acid, ceramides, and more.',
            focusKeyword: 'hydrating skincare ingredients',
            seoScore: 92,
            createdAt: new Date('2024-01-22T14:30:00Z').getTime(),
        },
        {
            title: 'Sensitive Skin Solutions: A Gentle Approach to Luxury Skincare',
            slug: 'sensitive-skin-solutions-gentle-luxury-skincare',
            excerpt: 'Navigate the world of luxury skincare with confidence. Learn how to pamper sensitive skin without irritation using premium, gentle formulations.',
            content: `<h2>Understanding Sensitive Skin</h2>
            <p>Sensitive skin affects nearly 50% of adults, yet it's often misunderstood. True sensitivity involves a compromised skin barrier that reacts to environmental factors, certain ingredients, or even emotional stress. The key to luxury skincare for sensitive skin lies in choosing products with gentle yet effective formulations that respect your skin's delicate nature while delivering visible results.</p>
            
            <h2>The Gentle Luxury Routine</h2>
            <p>Start with a creamy, non-foaming cleanser that removes impurities without stripping natural oils. Look for soothing ingredients like chamomile, allantoin, and centella asiatica. Introduce active ingredients slowly – begin with low concentrations of gentle exfoliants like lactic acid or bakuchiol (a gentle retinol alternative). Always patch test new products and introduce them one at a time to identify any potential irritants.</p>
            
            <h2>Premium Ingredients for Sensitive Skin</h2>
            <p>Luxury doesn't mean compromising on gentleness. Seek out products with ceramides to repair barrier function, niacinamide to reduce inflammation, and prebiotics to support healthy skin flora. Avoid common irritants like synthetic fragrances, harsh sulfates, and high concentrations of essential oils. Remember, the most expensive product isn't always the best – focus on clean, clinically-tested formulations designed specifically for sensitive skin types.</p>`,
            featuredImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
            featuredImageAlt: 'Gentle skincare products with calming botanical ingredients',
            authorId: authors[2].id,
            categoryId: categories[2].id,
            status: 'published',
            publishedAt: new Date('2024-02-05T09:15:00Z').getTime(),
            updatedAt: new Date('2024-02-05T09:15:00Z').getTime(),
            readTime: 7,
            viewCount: 1654,
            shareCount: 73,
            metaTitle: 'Sensitive Skin Luxury Skincare Guide | Gentle Solutions That Work',
            metaDescription: 'Expert guide to luxury skincare for sensitive skin. Discover gentle, effective ingredients and routines that pamper without irritation.',
            focusKeyword: 'sensitive skin luxury skincare',
            seoScore: 88,
            createdAt: new Date('2024-02-05T09:15:00Z').getTime(),
        },
        {
            title: 'Natural Beauty Powerhouses: Plant-Based Ingredients That Actually Work',
            slug: 'natural-beauty-plant-based-ingredients',
            excerpt: 'Explore the science behind nature\'s most effective skincare ingredients and learn how to harness botanical power for transformative results.',
            content: `<h2>The Renaissance of Natural Skincare</h2>
            <p>Natural skincare has evolved far beyond simple home remedies. Today's botanical formulations combine traditional wisdom with cutting-edge extraction techniques to deliver potent, scientifically-backed results. The key is understanding which plant-based ingredients have clinical research supporting their efficacy and how to incorporate them into a modern skincare routine.</p>
            
            <h2>Proven Botanical Actives</h2>
            <p>Bakuchiol, derived from the Babchi plant, offers retinol-like benefits without irritation, making it perfect for sensitive skin or daytime use. Green tea extract provides powerful antioxidant protection, while rosehip oil delivers vitamin C and essential fatty acids for cellular repair. Sea buckthorn oil is rich in omega-7 fatty acids, promoting skin healing and reducing inflammation. These ingredients aren't just trendy – they have peer-reviewed studies proving their effectiveness.</p>
            
            <h2>Building Your Natural Luxury Routine</h2>
            <p>The best natural skincare products combine multiple botanical actives with modern delivery systems for enhanced penetration and stability. Look for products that use supercritical CO2 extraction or cold-pressing to preserve the integrity of active compounds. Start with a gentle botanical cleanser, follow with a plant-based serum targeting your specific concerns, and finish with a natural moisturizer rich in plant oils and extracts. Remember, natural doesn't always mean gentle – introduce potent botanical actives gradually to avoid irritation.</p>`,
            featuredImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=600&fit=crop',
            featuredImageAlt: 'Fresh botanical ingredients and natural skincare extracts',
            authorId: authors[0].id,
            categoryId: categories[0].id,
            status: 'published',
            publishedAt: new Date('2024-02-12T11:45:00Z').getTime(),
            updatedAt: new Date('2024-02-12T11:45:00Z').getTime(),
            readTime: 6,
            viewCount: 2156,
            shareCount: 134,
            metaTitle: 'Natural Plant-Based Skincare Ingredients That Actually Work | Science-Backed',
            metaDescription: 'Discover the most effective plant-based skincare ingredients backed by science. Expert guide to natural beauty that delivers real results.',
            focusKeyword: 'natural plant-based skincare',
            seoScore: 90,
            createdAt: new Date('2024-02-12T11:45:00Z').getTime(),
        },
        {
            title: 'The Science of Vitamin C: Maximizing Your Glow Potential',
            slug: 'science-vitamin-c-maximizing-glow-potential',
            excerpt: 'Unlock the full potential of vitamin C in your skincare routine. Learn about different forms, proper application, and how to avoid common mistakes.',
            content: `<h2>Why Vitamin C is Essential for Healthy Skin</h2>
            <p>Vitamin C is one of the most researched and proven ingredients in skincare, yet it's also one of the most misunderstood. This powerful antioxidant stimulates collagen production, brightens hyperpigmentation, and provides crucial protection against environmental damage. However, not all vitamin C products are created equal, and understanding the differences can make or break your results.</p>
            
            <h2>Decoding Vitamin C Forms</h2>
            <p>L-Ascorbic acid is the most potent form but can be unstable and irritating. Magnesium ascorbyl phosphate offers gentleness with slower results, while sodium ascorbyl phosphate works well for acne-prone skin. Ascorbyl glucoside provides steady vitamin C release throughout the day. For beginners, start with stabilized forms like magnesium ascorbyl phosphate at 10-15% concentration, gradually working up to L-ascorbic acid if your skin tolerates it well.</p>
            
            <h2>Application Secrets for Maximum Efficacy</h2>
            <p>Timing and layering are crucial for vitamin C success. Apply on clean, dry skin in the morning for antioxidant protection, followed by moisturizer and SPF. Avoid mixing with retinol, benzoyl peroxide, or AHA/BHA acids, which can destabilize the vitamin C or cause irritation. Store products in a cool, dark place and replace them if they turn brown or orange. With proper use, expect to see brighter, more even-toned skin within 4-6 weeks of consistent application.</p>`,
            featuredImage: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&h=600&fit=crop',
            featuredImageAlt: 'Vitamin C serum with fresh orange slices and dropper',
            authorId: authors[1].id,
            categoryId: categories[1].id,
            status: 'published',
            publishedAt: new Date('2024-02-18T13:20:00Z').getTime(),
            updatedAt: new Date('2024-02-18T13:20:00Z').getTime(),
            readTime: 5,
            viewCount: 3201,
            shareCount: 178,
            metaTitle: 'Complete Guide to Vitamin C Skincare | Science-Based Tips for Glowing Skin',
            metaDescription: 'Master vitamin C skincare with our comprehensive guide. Learn about different forms, proper application, and expert tips for maximum results.',
            focusKeyword: 'vitamin C skincare',
            seoScore: 94,
            createdAt: new Date('2024-02-18T13:20:00Z').getTime(),
        },
        {
            title: 'Clear Skin Confidence: Modern Acne Solutions for Adult Skin',
            slug: 'clear-skin-confidence-modern-acne-solutions-adults',
            excerpt: 'Adult acne requires a sophisticated approach. Discover gentle yet effective treatments that clear breakouts without compromising your skin barrier.',
            content: `<h2>Understanding Adult Acne</h2>
            <p>Adult acne affects 25% of women and 12% of men well into their 40s and 50s. Unlike teenage acne, adult breakouts are often hormonal, stress-related, or caused by environmental factors. The skin is also more sensitive and slower to heal, requiring a gentler approach that balances effective treatment with barrier protection. Modern acne solutions focus on multiple pathways: reducing inflammation, regulating oil production, and promoting healthy cell turnover.</p>
            
            <h2>The Gentle-Effective Treatment Protocol</h2>
            <p>Start with a gentle, pH-balanced cleanser containing salicylic acid to unclog pores without over-drying. Follow with a niacinamide serum to reduce inflammation and regulate sebum production. Introduce retinol gradually – start with 0.25% twice weekly, building tolerance over 6-8 weeks. Spot treatments with benzoyl peroxide or sulfur can target active breakouts without affecting the entire face. Always use a lightweight, non-comedogenic moisturizer to maintain barrier function.</p>
            
            <h2>Advanced Ingredients for Stubborn Acne</h2>
            <p>For persistent acne, consider azelaic acid, which offers anti-inflammatory and antimicrobial benefits with minimal irritation. Zinc PCA helps regulate oil production while supporting healing. Alpha hydroxy acids like mandelic acid provide gentle exfoliation suitable for sensitive, acne-prone skin. Remember, consistency trumps intensity – a gentle routine used daily will outperform harsh treatments used sporadically. Most people see improvement within 6-8 weeks, with continued progress over 3-6 months.</p>`,
            featuredImage: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&h=600&fit=crop',
            featuredImageAlt: 'Clear, healthy skin close-up with gentle skincare products',
            authorId: authors[2].id,
            categoryId: categories[2].id,
            status: 'published',
            publishedAt: new Date('2024-02-25T16:10:00Z').getTime(),
            updatedAt: new Date('2024-02-25T16:10:00Z').getTime(),
            readTime: 7,
            viewCount: 1876,
            shareCount: 92,
            metaTitle: 'Adult Acne Solutions | Gentle, Effective Treatments for Clear Skin',
            metaDescription: 'Expert guide to treating adult acne with gentle, effective solutions. Modern approaches for clear, healthy skin without irritation.',
            focusKeyword: 'adult acne treatment',
            seoScore: 89,
            createdAt: new Date('2024-02-25T16:10:00Z').getTime(),
        },
        {
            title: 'Beauty Sleep: How Your Nighttime Routine Transforms Your Skin',
            slug: 'beauty-sleep-nighttime-routine-transforms-skin',
            excerpt: 'Discover the science behind beauty sleep and learn how to optimize your nighttime skincare routine for maximum regeneration and repair.',
            content: `<h2>The Science of Nighttime Skin Repair</h2>
            <p>While you sleep, your skin enters its most active repair phase. Cell turnover increases by up to 30%, collagen production peaks, and your skin's pH becomes more alkaline, allowing for better absorption of active ingredients. Blood flow to the skin increases, delivering nutrients and oxygen while removing toxins. This natural repair process makes nighttime the optimal window for using your most potent skincare treatments.</p>
            
            <h2>Building the Perfect PM Routine</h2>
            <p>Start with thorough cleansing to remove makeup, sunscreen, and daily pollutants – consider double cleansing with an oil-based cleanser followed by a gentle water-based one. Apply treatment serums while skin is still slightly damp for enhanced penetration. This is the ideal time for retinoids, peptides, and alpha hydroxy acids, which can make skin photosensitive. Layer from thinnest to thickest consistency, allowing each product to absorb before applying the next.</p>
            
            <h2>Advanced Nighttime Strategies</h2>
            <p>Consider using a humidifier to maintain optimal moisture levels while you sleep. Silk or satin pillowcases reduce friction and help preserve your skincare products. For intensive treatment, try the "skin cycling" method: alternate between exfoliation nights, retinoid nights, and recovery nights with gentle, hydrating products. Don't forget your neck and décolletage – these areas are often neglected but show signs of aging early. With consistent nighttime care, most people notice improved texture and radiance within 2-4 weeks.</p>`,
            featuredImage: 'https://images.unsplash.com/photo-1544717342-6e4d999de2a4?w=800&h=600&fit=crop',
            featuredImageAlt: 'Serene nighttime skincare setup with moon and stars',
            authorId: authors[0].id,
            categoryId: categories[0].id,
            status: 'published',
            publishedAt: new Date('2024-03-05T20:30:00Z').getTime(),
            updatedAt: new Date('2024-03-05T20:30:00Z').getTime(),
            readTime: 6,
            viewCount: 2543,
            shareCount: 167,
            metaTitle: 'Beauty Sleep: Complete Nighttime Skincare Routine Guide | Transform Your Skin',
            metaDescription: 'Optimize your nighttime skincare routine for maximum skin repair. Expert guide to beauty sleep and the science of overnight skin transformation.',
            focusKeyword: 'nighttime skincare routine',
            seoScore: 91,
            createdAt: new Date('2024-03-05T20:30:00Z').getTime(),
        },
        {
            title: 'Luxury Skincare Investment Guide: Which Products Are Worth the Splurge',
            slug: 'luxury-skincare-investment-guide-worth-splurge',
            excerpt: 'Navigate the world of high-end skincare with confidence. Learn which luxury products deliver on their promises and where to save versus splurge.',
            content: `<h2>The Psychology and Science of Luxury Skincare</h2>
            <p>Luxury skincare isn't just about status – the best premium products often contain higher concentrations of active ingredients, use advanced delivery systems, and undergo extensive research and testing. However, price doesn't always correlate with efficacy. Understanding what makes a product truly luxurious versus merely expensive can help you make informed decisions that maximize both results and value.</p>
            
            <h2>Where to Splurge: Investment-Worthy Categories</h2>
            <p>Serums and treatments are often worth the luxury investment, as they contain the highest concentrations of active ingredients and advanced formulations. High-end retinol products typically use more stable, less irritating forms with sophisticated delivery systems. Luxury moisturizers often feature rare botanical extracts and innovative textures that provide superior comfort and absorption. Eye creams in the luxury category frequently contain specialized peptides and caffeine complexes that drugstore versions lack.</p>
            
            <h2>Smart Savings: Where to Economize</h2>
            <p>Cleansers, regardless of price, are washed off within minutes, making expensive options unnecessary unless you have specific sensitivities. Basic sunscreens perform the same protective function regardless of price – focus on SPF level and broad-spectrum protection rather than brand prestige. Toners and essences, while beneficial, often contain similar ingredients across price points. The key is building a strategic routine: invest in 2-3 key treatment products and save on supporting products that don't require premium formulations.</p>`,
            featuredImage: 'https://images.unsplash.com/photo-1596755894853-b3d705094e27?w=800&h=600&fit=crop',
            featuredImageAlt: 'Elegant luxury skincare products displayed on marble vanity',
            authorId: authors[1].id,
            categoryId: categories[1].id,
            status: 'published',
            publishedAt: new Date('2024-03-12T15:45:00Z').getTime(),
            updatedAt: new Date('2024-03-12T15:45:00Z').getTime(),
            readTime: 8,
            viewCount: 3876,
            shareCount: 234,
            metaTitle: 'Luxury Skincare Investment Guide | Where to Splurge vs Save | Expert Tips',
            metaDescription: 'Make smart luxury skincare investments with our expert guide. Learn which high-end products are worth the splurge and where to save money.',
            focusKeyword: 'luxury skincare investment guide',
            seoScore: 87,
            createdAt: new Date('2024-03-12T15:45:00Z').getTime(),
        }
    ];

    await db.insert(blogPosts).values(sampleBlogPosts);
    
    console.log('✅ Blog posts seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});