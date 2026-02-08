// script.js لـ index.html: يعدل الروابط لتضيف slug المجلد + ?id=

document.addEventListener('DOMContentLoaded', () => {
    // map من ID لـ slug المجلد (بالإنجليزي زي ما طلبت، سهل وSEO-friendly)
    const storySlugs = {
        1: 'story',     // قصص الأنبياء بالصلصال
        2: 'story',        // قصص الحيوان في القرآن
        3: 'story',         // قصص الإنسان/البشر في القرآن
        4: 'story'           // قصص النساء في القرآن
        // أضف المزيد لو عايز قصص جديدة، زي 5: 'another-story'
    };

    // حدد كل الروابط للقصص (بناءً على href الحالي /story/1 إلخ)
    const storyLinks = document.querySelectorAll('a[href^="/story/"]');

    storyLinks.forEach(link => {
        const currentHref = link.getAttribute('href'); // زي /story/1
        const idMatch = currentHref.match(/\/story\/(\d+)/);
        const storyId = idMatch ? idMatch[1] : null;

        if (storyId && storySlugs[storyId]) {
            const slug = storySlugs[storyId];
            // غير اللينك لـ /story/slug/story.html?id=ID
            const newHref = `/story/${slug}/story.html?id=${storyId}`;
            link.setAttribute('href', newHref);

            // إضافة hover effect جامد للـ UX
            link.addEventListener('mouseenter', () => {
                link.style.color = 'hsl(var(--primary))';
                link.style.transition = 'color 0.3s ease';
            });
            link.addEventListener('mouseleave', () => {
                link.style.color = ''; // رجوع للأصلي
            });
        }
    });

    console.log('Story links updated with slugs and IDs!'); // للـ debug
});