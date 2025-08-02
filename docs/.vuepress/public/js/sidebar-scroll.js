// 导航栏选中项滚动居中的JavaScript实现

// 防抖函数，用于优化频繁触发的事件
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

document.addEventListener('DOMContentLoaded', function() {
  // 初始化侧边栏滚动功能
  initSidebarScroll();
  
  // 添加侧边栏搜索框
  addSidebarSearch();
  
  // 检查是否需要搜索定位
  checkSearchPosition();
  
  // 监听Vue路由变化
  waitForVue();
  
  // 等待Vue加载完成并监听路由变化
  function waitForVue() {
    const checkVue = setInterval(() => {
      if (typeof Vue !== 'undefined') {
        clearInterval(checkVue);
        // 监听Vue路由变化
        if (window.$vuePress && window.$vuePress.$router) {
          window.$vuePress.$router.afterEach(() => {
            setTimeout(() => {
              const sidebar = document.querySelector('.sidebar-links');
              const activeLink = document.querySelector('.sidebar-link.active');
              if (sidebar && activeLink) {
                scrollActiveToCenter(sidebar, activeLink);
                // 路由变化后重新添加点击监听器
                addClickListeners();
              }
            }, 100);
          });
        }
      }
    }, 100);
  }
  
  // 监听DOM变化，重新添加点击监听器
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // 当DOM发生变化时，重新添加点击监听器
        addClickListeners();
      }
    });
  });
  
  // 开始观察文档变化
  observer.observe(document.body, { childList: true, subtree: true });

  function initSidebarScroll() {
    // 等待侧边栏DOM元素加载完成
    const checkSidebar = setInterval(() => {
      const sidebar = document.querySelector('.sidebar-links');
      const activeLink = document.querySelector('.sidebar-link.active');
      
      if (sidebar && activeLink) {
        clearInterval(checkSidebar);
        scrollActiveToCenter(sidebar, activeLink);
        
        // 添加点击事件监听器到所有导航链接
        addClickListeners();
        
        // 监听路由变化，当页面切换时重新滚动
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' || mutation.type === 'childList') {
              const newActiveLink = document.querySelector('.sidebar-link.active');
              if (newActiveLink) {
                scrollActiveToCenter(sidebar, newActiveLink);
              }
              // 当DOM变化时，重新添加点击事件监听器
              addClickListeners();
            }
          });
        });
        
        observer.observe(sidebar, {
          attributes: true,
          childList: true,
          subtree: true
        });
      }
    }, 100);
  }
  
  // 添加侧边栏搜索框
  function addSidebarSearch() {
    // 等待侧边栏加载完成
    const checkSidebar = setInterval(() => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        clearInterval(checkSidebar);
        
        // 创建搜索容器
        const searchContainer = document.createElement('div');
        searchContainer.className = 'sidebar-search-container';
        searchContainer.style.cssText = `
          padding: 0.5rem 1rem;
          margin-bottom: 1rem;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
          border-bottom: 1px solid #eaecef;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        `;
        
        // 创建搜索框
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '搜索文档...';
        searchInput.className = 'sidebar-search-input';
        searchInput.style.cssText = `
          width: 100%;
          padding: 0.5rem 0.7rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.3s;
          background: #f8f8f8 url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>') no-repeat;
          background-position: calc(100% - 8px) center;
          background-size: 16px;
          padding-right: 30px;
        `;
        
        // 添加搜索框聚焦样式
        searchInput.addEventListener('focus', () => {
          searchInput.style.borderColor = '#42b983';
          searchInput.style.boxShadow = '0 0 0 2px rgba(66, 185, 131, 0.2)';
          searchInput.style.background = '#fff url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%2342b983" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>\') no-repeat';
          searchInput.style.backgroundPosition = 'calc(100% - 8px) center';
          searchInput.style.backgroundSize = '16px';
        });
        
        searchInput.addEventListener('blur', () => {
          searchInput.style.borderColor = '#ddd';
          searchInput.style.boxShadow = 'none';
          searchInput.style.background = '#f8f8f8 url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>\') no-repeat';
          searchInput.style.backgroundPosition = 'calc(100% - 8px) center';
          searchInput.style.backgroundSize = '16px';
        });
        
        // 创建搜索结果容器
        const searchResults = document.createElement('div');
        searchResults.className = 'sidebar-search-results';
        searchResults.style.cssText = `
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #eaecef;
          border-top: none;
          border-radius: 0 0 4px 4px;
          max-height: 300px;
          overflow-y: auto;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          z-index: 100;
          display: none;
        `;
        
        // 添加搜索功能
        searchInput.addEventListener('input', debounce(function() {
          const query = this.value.toLowerCase().trim();
          if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
          }
          
          // 获取所有导航链接
          const links = document.querySelectorAll('.sidebar-link');
          let results = [];
          
          // 搜索匹配项
          links.forEach(link => {
            const text = link.textContent.toLowerCase();
            if (text.includes(query)) {
              results.push({
                element: link,
                text: link.textContent,
                url: link.getAttribute('href')
              });
            }
          });
          
          // 显示搜索结果
          if (results.length > 0) {
            searchResults.innerHTML = '';
            results.forEach(result => {
              const resultItem = document.createElement('div');
              resultItem.className = 'sidebar-search-result-item';
              resultItem.style.cssText = `
                padding: 0.5rem 1rem;
                border-bottom: 1px solid #eaecef;
                cursor: pointer;
                transition: background 0.2s;
              `;
              
              // 高亮匹配文本
              const highlightedText = result.text.replace(
                new RegExp(query, 'gi'),
                match => `<span style="background-color: #ffeb3b; font-weight: bold;">${match}</span>`
              );
              
              resultItem.innerHTML = highlightedText;
              
              // 点击结果项导航到对应页面并自动定位
              resultItem.addEventListener('click', () => {
                // 先隐藏搜索结果
                searchResults.style.display = 'none';
                searchInput.value = '';
                
                // 如果是当前页面的链接，直接滚动定位
                if (result.url === window.location.pathname || 
                    result.url.replace(/\.html$/, '') === window.location.pathname.replace(/\.html$/, '')) {
                  // 找到对应的侧边栏链接并滚动定位
                  setTimeout(() => {
                    const sidebar = document.querySelector('.sidebar-links');
                    if (sidebar && result.element) {
                      // 移除所有active类
                      document.querySelectorAll('.sidebar-link.active').forEach(link => {
                        link.classList.remove('active');
                      });
                      // 添加active类到选中项
                      result.element.classList.add('active');
                      // 滚动到选中项
                      scrollActiveToCenter(sidebar, result.element);
                    }
                  }, 100);
                } else {
                   // 跳转到其他页面，并添加搜索定位参数
                   const targetUrl = new URL(result.url, window.location.origin);
                   targetUrl.searchParams.set('search_target', result.text);
                   window.location.href = targetUrl.toString();
                 }
              });}]}}
              
              // 鼠标悬停效果
              resultItem.addEventListener('mouseenter', () => {
                resultItem.style.backgroundColor = '#f6f8fa';
              });
              
              resultItem.addEventListener('mouseleave', () => {
                resultItem.style.backgroundColor = 'white';
              });
              
              searchResults.appendChild(resultItem);
            });
            
            searchResults.style.display = 'block';
          } else {
            searchResults.innerHTML = '<div style="padding: 0.5rem 1rem; color: #999;">没有找到匹配项</div>';
            searchResults.style.display = 'block';
          }
        }, 300));
        
        // 点击外部关闭搜索结果
        document.addEventListener('click', (e) => {
          if (!searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
          }
        });
        
        // 添加到DOM
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(searchResults);
        sidebar.insertBefore(searchContainer, sidebar.firstChild);
      }
    }, 100);
  }
  
  // 为所有导航链接添加点击事件监听器
  function addClickListeners() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
      // 移除旧的事件监听器，避免重复
      link.removeEventListener('click', handleLinkClick);
      // 添加新的事件监听器
      link.addEventListener('click', handleLinkClick);
    });
  }
  
  // 处理链接点击事件
  function handleLinkClick(event) {
    // 使用setTimeout确保在路由变化后执行
    setTimeout(() => {
      const sidebar = document.querySelector('.sidebar-links');
      const activeLink = document.querySelector('.sidebar-link.active');
      if (sidebar && activeLink) {
        scrollActiveToCenter(sidebar, activeLink);
      }
    }, 50);
  }
  
  // 监听页面滚动事件，确保在页面滚动时也能触发导航栏的滚动居中
  let scrollTimer;
  window.addEventListener('scroll', function() {
    // 使用防抖技术，避免频繁触发
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const sidebar = document.querySelector('.sidebar-links');
      const activeLink = document.querySelector('.sidebar-link.active');
      if (sidebar && activeLink) {
        scrollActiveToCenter(sidebar, activeLink);
      }
    }, 200);
  });

  function scrollActiveToCenter(sidebar, activeLink) {
    // 计算需要滚动的位置，使活动链接居中
    const sidebarHeight = sidebar.clientHeight;
    const activeLinkTop = activeLink.offsetTop;
    const activeLinkHeight = activeLink.clientHeight;
    
    // 计算滚动位置，使活动链接垂直居中
    const scrollTop = activeLinkTop - (sidebarHeight / 2) + (activeLinkHeight / 2);
    
    // 确保滚动位置在有效范围内
    const maxScrollTop = sidebar.scrollHeight - sidebar.clientHeight;
    const safeScrollTop = Math.max(0, Math.min(scrollTop, maxScrollTop));
    
    // 使用平滑滚动效果
    sidebar.scrollTo({
      top: safeScrollTop,
      behavior: 'smooth'
    });
    
    // 添加呼吸灯效果，使选中项更醒目
    addPulseEffect(activeLink);
    
    // 添加面包屑导航提示
    updateBreadcrumb(activeLink);
  }
  
  // 添加呼吸灯效果
  function addPulseEffect(element) {
    // 移除所有现有的脉冲效果
    const existingPulses = document.querySelectorAll('.sidebar-pulse-effect');
    existingPulses.forEach(pulse => pulse.remove());
    
    // 创建新的脉冲效果元素
    const pulse = document.createElement('span');
    pulse.className = 'sidebar-pulse-effect';
    pulse.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(66, 185, 131, 0.2);
      border-radius: 0 4px 4px 0;
      pointer-events: none;
      z-index: -1;
      animation: pulse 1.5s ease-in-out;
    `;
    
    // 添加脉冲动画样式
    if (!document.getElementById('pulse-animation')) {
      const style = document.createElement('style');
      style.id = 'pulse-animation';
      style.textContent = `
        @keyframes pulse {
          0% { opacity: 0.8; transform: scale(0.95); }
          50% { opacity: 0.2; transform: scale(1.02); }
          100% { opacity: 0; transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // 添加到活动链接
    element.style.position = 'relative';
    element.appendChild(pulse);
    
    // 动画结束后移除
    setTimeout(() => {
      pulse.remove();
    }, 1500);
  }
  
  // 更新面包屑导航
  function updateBreadcrumb(activeLink) {
    // 检查是否已存在面包屑容器
    let breadcrumb = document.querySelector('.sidebar-breadcrumb');
    
    // 如果不存在，创建一个
    if (!breadcrumb) {
      breadcrumb = document.createElement('div');
      breadcrumb.className = 'sidebar-breadcrumb';
      breadcrumb.style.cssText = `
        position: fixed;
        top: 3.6rem;
        left: 0;
        width: 100%;
        padding: 0.5rem 1rem 0.5rem 320px;
        background-color: rgba(255, 255, 255, 0.9);
        border-bottom: 1px solid #eaecef;
        font-size: 0.9rem;
        color: #999;
        z-index: 10;
        backdrop-filter: blur(5px);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        transition: opacity 0.3s;
      `;
      document.body.appendChild(breadcrumb);
      
      // 添加面包屑样式
      if (!document.getElementById('breadcrumb-style')) {
        const style = document.createElement('style');
        style.id = 'breadcrumb-style';
        style.textContent = `
          .sidebar-breadcrumb a {
            color: #42b983;
            text-decoration: none;
            margin: 0 0.3rem;
          }
          .sidebar-breadcrumb a:hover {
            text-decoration: underline;
          }
          .sidebar-breadcrumb .separator {
            margin: 0 0.3rem;
            color: #ccc;
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    // 构建面包屑路径
    let path = [];
    let current = activeLink;
    let text = current.textContent.trim();
    path.unshift({ text, link: current.getAttribute('href') });
    
    // 查找父级分组
    let parent = current.closest('.sidebar-group');
    while (parent) {
      const heading = parent.querySelector('.sidebar-heading');
      if (heading) {
        path.unshift({ text: heading.textContent.trim(), link: '#' });
      }
      parent = parent.parentElement.closest('.sidebar-group');
    }
    
    // 生成面包屑HTML
    breadcrumb.innerHTML = '当前位置：';
    path.forEach((item, index) => {
      if (index > 0) {
        breadcrumb.innerHTML += '<span class="separator">›</span>';
      }
      if (index === path.length - 1) {
        breadcrumb.innerHTML += `<span>${item.text}</span>`;
      } else {
        breadcrumb.innerHTML += `<a href="${item.link}">${item.text}</a>`;
      }
    });
    
    // 显示面包屑
    breadcrumb.style.opacity = '1';
    
    // 3秒后淡出
    setTimeout(() => {
      breadcrumb.style.opacity = '0';
    }, 3000);
  }
}

// 检查搜索定位参数
function checkSearchPosition() {
  // 检查URL中是否有搜索定位标识
  const urlParams = new URLSearchParams(window.location.search);
  const searchTarget = urlParams.get('search_target');
  
  if (searchTarget) {
    // 延迟执行，确保页面完全加载
    setTimeout(() => {
      const sidebar = document.querySelector('.sidebar-links');
      if (sidebar) {
        // 查找匹配的侧边栏链接
        const links = document.querySelectorAll('.sidebar-link');
        let targetLink = null;
        
        links.forEach(link => {
          const linkText = link.textContent.toLowerCase();
          if (linkText.includes(searchTarget.toLowerCase())) {
            targetLink = link;
          }
        });
        
        if (targetLink) {
          // 移除所有active类
          document.querySelectorAll('.sidebar-link.active').forEach(link => {
            link.classList.remove('active');
          });
          // 添加active类到目标项
          targetLink.classList.add('active');
          // 滚动到目标项
          scrollActiveToCenter(sidebar, targetLink);
          
          // 清除URL参数
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }, 500);
  }
});