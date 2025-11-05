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

// ublock-loader.js
(function() {
    console.log('正在加载 uBlock Origin 核心...');
    
    // 创建样式屏蔽
    const style = document.createElement('style');
    style.textContent = `
        .ad, .ads, .advertisement, [class*="ad-"], 
        [id*="ad-"], .google-ad, .adsbygoogle,
        iframe[src*="doubleclick"], iframe[src*="googleads"],
        ins.adsbygoogle {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            opacity: 0 !important;
        }
    `;
    document.head.appendChild(style);
    
    // 屏蔽请求
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (isAdUrl(url)) {
            console.log('屏蔽了广告请求:', url);
            return Promise.reject(new Error('广告请求被屏蔽'));
        }
        return originalFetch.apply(this, args);
    };
    
    function isAdUrl(url) {
        const adKeywords = [
            'doubleclick.net',
            'googleads',
            'googlesyndication',
            'adsystem',
            'adservice',
            'adsafeprotected'
        ];
        return adKeywords.some(keyword => url.includes(keyword));
    }
    
    // 定期清理新出现的广告
    setInterval(() => {
        const adElements = document.querySelectorAll([
            '.ad', '.ads', '.advertisement',
            '[class*="ad-"]', '[id*="ad-"]',
            'iframe[src*="doubleclick"]',
            'iframe[src*="googleads"]'
        ].join(','));
        
        adElements.forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    }, 1000);
})();

// custom.js - 用于PakePlus应用内视频全屏支持
(function() {
    'use strict';
    
    // 定义一个函数来处理视频的全屏请求
    function enterFullscreen(videoElement) {
        // 优先检查标准的HTML5全屏API
        if (videoElement.requestFullscreen) {
            videoElement.requestFullscreen();
        } else if (videoElement.webkitRequestFullscreen) { // 针对iOS Safari和旧版Android
            videoElement.webkitRequestFullscreen();
        } else if (videoElement.webkitEnterFullscreen) { // 特别针对iOS的Safari
            videoElement.webkitEnterFullscreen();
        } else if (videoElement.mozRequestFullScreen) { // Firefox
            videoElement.mozRequestFullScreen();
        } else if (videoElement.msRequestFullscreen) { // IE/Edge
            videoElement.msRequestFullscreen();
        } else {
            console.warn('Fullscreen API is not supported in this context.');
            // 如果不支持标准全屏，尝试模拟全屏效果：旋转至横屏并放大元素
            simulateFullscreen(videoElement);
        }
    }
    
    // 备用方案：模拟全屏效果（当标准API不可用时）
    function simulateFullscreen(videoElement) {
        videoElement.style.width = '100%';
        videoElement.style.height = '100vh'; // 使用视口高度
        videoElement.style.objectFit = 'cover';
        videoElement.style.position = 'fixed';
        videoElement.style.top = '0';
        videoElement.style.left = '0';
        videoElement.style.zIndex = '9999';
        
        // 尝试锁定横屏 (注意：此API并非所有浏览器都支持)
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(err => {
                console.log('Orientation lock failed: ', err);
            });
        }
    }
    
    // 监听页面上的点击事件，劫持视频全屏按钮的点击
    document.addEventListener('click', function(e) {
        // 这里需要根据您目标网页的全屏按钮选择器进行调整
        // 例如，如果全屏按钮的类是'.fullscreen-btn'，则可以这样写：
        // if (e.target.closest('.fullscreen-btn')) {
        // 由于选择器未知，我们先尝试查找视频元素并直接触发
        const video = document.querySelector('video');
        if (video) {
            enterFullscreen(video);
            e.preventDefault(); // 阻止可能的默认行为
        }
        // }
    }, true);
    
    // 此外，监听视频元素本身的变化，例如动态加载的视频
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeName === 'VIDEO') {
                    // 为新添加的视频元素也绑定全屏处理逻辑
                    setupVideo(node);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('PakePlus视频全屏增强脚本已加载。');
})();