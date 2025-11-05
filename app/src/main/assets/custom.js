// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })

// simple-ublock.js
class SimpleBlocker {
    constructor() {
        this.filters = [];
        this.loadDefaultFilters();
    }
    
    loadDefaultFilters() {
        // 内嵌一些基础规则
        this.filters = [
            '##.ad',
            '##.advertisement',
            '##[id*="ad-"]',
            '##.google-ad',
            '##.adsbygoogle',
            '##iframe[src*="doubleclick.net"]',
            '##iframe[src*="googleads"]'
            // 可以添加更多规则...
        ];
    }
    
    applyFilters() {
        this.filters.forEach(filter => {
            if (filter.startsWith('##')) {
                this.hideElements(filter.substring(2));
            }
        });
    }
    
    hideElements(selector) {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.display = 'none';
                el.remove(); // 或者直接移除
            });
            if (elements.length > 0) {
                console.log(`屏蔽了 ${elements.length} 个元素: ${selector}`);
            }
        } catch (e) {
            console.warn('选择器无效:', selector);
        }
    }
    
    // 动态添加新规则
    addFilter(filter) {
        this.filters.push(filter);
        this.applyFilters();
    }
}

// 初始化并应用
const blocker = new SimpleBlocker();
document.addEventListener('DOMContentLoaded', () => {
    blocker.applyFilters();
});

// 监听动态内容变化
new MutationObserver(() => {
    blocker.applyFilters();
}).observe(document.body, {
    childList: true,
    subtree: true
});
