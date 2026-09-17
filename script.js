// Register stories and list the paths to their Markdown chapter files
const stories = {
    'story-1': {
        title: 'The Quiet After Midnight',
        rating: 'General',
        published: '2026-09-18',
        tags: ['#Oneshot','#Alternate Universe', '#Slice of Life'],
        chapterFiles: [
            'stories/story-1/ch1.md'
        ]
    },
    
};

// Helper: Calculate word count from plain text
function countWords(text) {
    const cleanText = text.replace(/<[^>]*>/g, ' ');
    const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
}

// Fetch markdown file content asynchronously
async function fetchChapterMarkdown(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Could not load file: ${filePath}`);
        return await response.text();
    } catch (error) {
        console.error(error);
        return "*Error loading chapter content.*";
    }
}

// Calculate total words for all chapters in a story on load
document.addEventListener('DOMContentLoaded', async () => {
    for (const id in stories) {
        const story = stories[id];
        let totalWords = 0;

        for (const filePath of story.chapterFiles) {
            const rawMarkdown = await fetchChapterMarkdown(filePath);
            totalWords += countWords(rawMarkdown);
        }

        const wordCountEl = document.getElementById(`word-count-${id}`);
        if (wordCountEl) {
            wordCountEl.textContent = totalWords.toLocaleString();
        }
    }
});

// Open story chapter
async function openStory(id, chapterIndex = 0) {
    const data = stories[id];
    if (!data) return;

    const totalChapters = data.chapterFiles.length;
    const filePath = data.chapterFiles[chapterIndex];

    // Show loading indicator
    document.getElementById('story-content').innerHTML = '<p style="font-family: var(--font-mono);">Loading chapter...</p>';
    document.getElementById('index-view').style.display = 'none';
    document.getElementById('reader-view').style.display = 'block';

    // Fetch and convert Markdown to HTML using marked.js
    const rawMarkdown = await fetchChapterMarkdown(filePath);
    const htmlContent = marked.parse(rawMarkdown);

    // Navigation buttons logic
    const hasPrev = chapterIndex > 0;
    const hasNext = chapterIndex < totalChapters - 1;

    const readerTemplate = `
        <h1 style="font-size: 2rem; margin-bottom: 0.25rem; letter-spacing: -0.02em;">${data.title}</h1>
        <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--subdued-text); margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
            Rating: ${data.rating} | Chapter ${chapterIndex + 1} of ${totalChapters} | Published: ${data.published}
        </div>
        
        <div class="chapter-header" style="font-family: var(--font-mono); font-size: 0.9rem; text-transform: uppercase; color: var(--subdued-text); margin-bottom: 1.5rem;">
            — Chapter ${chapterIndex + 1} —
        </div>

        <div class="reader-content">
            ${htmlContent}
        </div>

        <div class="chapter-nav" style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 1.5rem; margin-top: 3rem; font-family: var(--font-mono); font-size: 0.85rem;">
            <button class="back-btn" ${!hasPrev ? 'style="visibility:hidden;"' : ''} onclick="openStory('${id}', ${chapterIndex - 1})">← Previous Chapter</button>
            <span>${chapterIndex + 1} / ${totalChapters}</span>
            <button class="back-btn" ${!hasNext ? 'style="visibility:hidden;"' : ''} onclick="openStory('${id}', ${chapterIndex + 1})">Next Chapter →</button>
        </div>
    `;

    document.getElementById('story-content').innerHTML = readerTemplate;
    window.scrollTo(0, 0);
}

function showIndex() {
    document.getElementById('reader-view').style.display = 'none';
    document.getElementById('index-view').style.display = 'block';
}

document.getElementById('home-link').addEventListener('click', (e) => {
    e.preventDefault();
    showIndex();
});

function filterStories(category, btn) {
    const buttons = document.querySelectorAll('.filter-tag');
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cards = document.querySelectorAll('.story-card');
    cards.forEach(card => {
        const tags = card.getAttribute('data-tags');
        if (category === 'all' || tags.includes(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}


