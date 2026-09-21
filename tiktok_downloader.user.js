// ==UserScript==
// @name         G+ TikTok Downloader
// @namespace    http://tampermonkey.net/
// @version      1.10
// @description  Downloads TikTok videos in high quality without watermarks. Integrates into the action bar.
// @author       Antigravity
// @match        *://*.tiktok.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @connect      tikwm.com
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    const loadingIconHtml = `
        <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;">
            <style>@keyframes spin-tt { 100% { transform: rotate(360deg); } }</style>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" style="animation: spin-tt 1s linear infinite; transform-origin: center;"></path>
        </svg>
    `;

    const doneIconHtml = `
        <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;

    const dlIconHtml = `
        <svg width="55%" height="55%" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="pointer-events: none;">
            <path d="M12 16L7 11L8.4 9.55L11 12.15V4H13V12.15L15.6 9.55L17 11L12 16ZM6 20C5.45 20 4.97917 19.8042 4.5875 19.4125C4.19583 19.0208 4 18.55 4 18V15H6V18H18V15H20V18C20 18.55 19.8042 19.0208 19.4125 19.4125C19.0208 19.8042 18.55 20 18 20H6Z"/>
        </svg>
    `;

    async function downloadVideo(btnElement) {
        try {
            btnElement.style.pointerEvents = 'none';
            btnElement.innerHTML = loadingIconHtml;

            let targetUrl = null;

            const input = document.querySelector('input[value*="/video/"], input[value*="/photo/"]');
            if (input && input.value) {
                targetUrl = input.value;
            }

            if (!targetUrl) {
                let curr = btnElement;
                let mediaId = null;
                let author = null;
                
                while (curr && curr !== document.body && !targetUrl) {
                    const links = Array.from(curr.querySelectorAll('a[href*="/video/"], a[href*="/v/"], a[href*="/photo/"]'))
                                       .filter(a => !a.href.includes('/tag/') && !a.href.includes('/music/'));
                    
                    if (links.length > 0) {
                        const uniqueIds = new Set(
                            links.map(a => {
                                const match = a.href.match(/\/(?:video|photo)\/(\d+)/);
                                return match ? match[1] : null;
                            }).filter(id => id)
                        );
                        
                        if (uniqueIds.size === 1) {
                            targetUrl = links[0].href;
                            break;
                        } else if (uniqueIds.size > 1) {
                            break;
                        }
                    }

                    if (!mediaId) {
                        const idMatch = (curr.id || '').match(/(\d{18,20})/);
                        if (idMatch) {
                            mediaId = idMatch[1];
                        } else {
                            const playerNode = curr.querySelector('[id^="xgwrapper-"]');
                            if (playerNode) {
                                const childMatch = playerNode.id.match(/(\d{18,20})/);
                                if (childMatch) mediaId = childMatch[1];
                            }
                        }
                    }
                    
                    if (!author) {
                        const authorLink = curr.querySelector('a[href^="/@"]');
                        if (authorLink) {
                            const authorMatch = authorLink.getAttribute('href').match(/^\/(@[\w\.-]+)/);
                            if (authorMatch) author = authorMatch[1];
                        }
                    }
                    
                    curr = curr.parentElement;
                }
                
                if (!targetUrl && mediaId) {
                    author = author || '@user';
                    targetUrl = `https://www.tiktok.com/${author}/video/${mediaId}`;
                }
            }

            if (!targetUrl && (window.location.href.includes('/video/') || window.location.href.includes('/v/') || window.location.href.includes('/photo/'))) {
                targetUrl = window.location.href;
            }

            if (!targetUrl) {
                alert('Could not determine the specific video URL.');
                btnElement.innerHTML = dlIconHtml;
                btnElement.style.pointerEvents = 'auto';
                return;
            }

            const apiUrl = 'https://www.tikwm.com/api/?url=' + encodeURIComponent(targetUrl) + '&hd=1';

            GM_xmlhttpRequest({
                method: 'GET',
                url: apiUrl,
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        if (data.code === 0 && data.data) {
                            const mediaUrl = data.data.hdplay || data.data.play || (data.data.images && data.data.images[0]); 
                            
                            if (!mediaUrl) {
                                alert('Could not extract media.');
                                btnElement.innerHTML = dlIconHtml;
                                btnElement.style.pointerEvents = 'auto';
                                return;
                            }
                            
                            const title = data.data.title || 'tiktok_video';
                            const author = data.data.author ? data.data.author.unique_id : 'user';
                            const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40);
                            
                            const d = new Date();
                            const formattedDate = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
                            
                            const isImage = mediaUrl.includes('.webp') || mediaUrl.includes('.jpeg') || mediaUrl.includes('.jpg');
                            const filename = `${author}-${formattedDate}-${cleanTitle}.${isImage ? 'jpg' : 'mp4'}`;

                            GM_download({
                                url: mediaUrl,
                                name: filename,
                                onload: () => {
                                    btnElement.innerHTML = doneIconHtml;
                                    setTimeout(() => { 
                                        btnElement.innerHTML = dlIconHtml; 
                                        btnElement.style.pointerEvents = 'auto'; 
                                    }, 3000);
                                },
                                onerror: (err) => {
                                    console.error(err);
                                    alert('Error downloading media.');
                                    btnElement.innerHTML = dlIconHtml;
                                    btnElement.style.pointerEvents = 'auto';
                                }
                            });
                        } else {
                            alert('Could not find the media via API.');
                            btnElement.innerHTML = dlIconHtml;
                            btnElement.style.pointerEvents = 'auto';
                        }
                    } catch (e) {
                        console.error(e);
                        alert('Error parsing API response.');
                        btnElement.innerHTML = dlIconHtml;
                        btnElement.style.pointerEvents = 'auto';
                    }
                },
                onerror: function(err) {
                    console.error(err);
                    alert('Network error when contacting the API.');
                    btnElement.innerHTML = dlIconHtml;
                    btnElement.style.pointerEvents = 'auto';
                }
            });
        } catch (error) {
            console.error(error);
            alert('An unexpected error occurred.');
            btnElement.innerHTML = dlIconHtml;
            btnElement.style.pointerEvents = 'auto';
        }
    }

    function injectButton() {
        const selectors = [
            '[data-e2e="like-icon"]',
            '[data-e2e="browser-like"]',
            '[data-e2e="browse-like-icon"]',
            '[data-e2e="search-like-icon"]',
            'button[aria-label="Like"]',
            'button[aria-label="like"]'
        ];
        
        const likeIcons = document.querySelectorAll(selectors.join(', '));

        likeIcons.forEach(likeIcon => {
            const likeBtn = likeIcon.closest('button') || likeIcon.closest('div[role="button"]') || likeIcon.parentElement;
            if (!likeBtn) return;

            const likeWrapper = likeBtn.parentElement; 
            if (!likeWrapper) return;

            if (likeWrapper.querySelector('.tt-integrated-dl-btn')) {
                return;
            }

            const btnRect = likeBtn.getBoundingClientRect();
            let isHorizontalLayout = false;
            
            if (btnRect.width > btnRect.height) {
                isHorizontalLayout = true;
            } else if (btnRect.width === btnRect.height && btnRect.width < 40) {
                isHorizontalLayout = true;
            }

            const dlBtn = document.createElement('button');
            const nativeClasses = typeof likeBtn.className === 'string' ? likeBtn.className : '';
            dlBtn.className = nativeClasses + (nativeClasses ? ' ' : '') + 'tt-integrated-dl-btn';
            
            const size = isHorizontalLayout ? '32px' : '48px'; 
            
            dlBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            dlBtn.style.border = 'none';
            dlBtn.style.borderRadius = '50%';
            dlBtn.style.width = size;
            dlBtn.style.height = size;
            dlBtn.style.minWidth = size;
            dlBtn.style.minHeight = size;
            dlBtn.style.display = 'flex';
            dlBtn.style.alignItems = 'center';
            dlBtn.style.justifyContent = 'center';
            dlBtn.style.cursor = 'pointer';
            dlBtn.style.color = 'white';
            dlBtn.style.transition = 'background-color 0.2s';
            dlBtn.style.flexShrink = '0';
            dlBtn.style.padding = '0';
            
            const computedWrapper = window.getComputedStyle(likeWrapper);
            const hasGap = computedWrapper.gap && computedWrapper.gap !== 'normal' && parseFloat(computedWrapper.gap) > 0;
            if (!hasGap && !nativeClasses) { 
                if (isHorizontalLayout) {
                    dlBtn.style.marginRight = '16px'; 
                } else {
                    dlBtn.style.marginBottom = '16px';
                }
            }
            
            dlBtn.onmouseover = () => dlBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            dlBtn.onmouseout = () => dlBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';

            dlBtn.innerHTML = dlIconHtml;
            likeWrapper.insertBefore(dlBtn, likeBtn);
        });
    }

    setInterval(injectButton, 1000);

    const handleGlobalClick = (e) => {
        const dlBtn = e.target.closest('.tt-integrated-dl-btn');
        if (dlBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            if (dlBtn.dataset.downloading === 'true') return;
            dlBtn.dataset.downloading = 'true';
            
            setTimeout(() => { dlBtn.dataset.downloading = 'false'; }, 5000);
            
            downloadVideo(dlBtn);
        }
    };

    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('pointerup', handleGlobalClick, true);

})();
