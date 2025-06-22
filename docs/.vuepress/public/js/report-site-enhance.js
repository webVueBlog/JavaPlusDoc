/**
 * 行业报告网站交互增强脚本
 */

// 在文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 检查是否在行业报告网站页面
  if (window.location.pathname.includes('/products/优质行业报告网站.html')) {
    enhanceReportSite();
  }
});

/**
 * 增强行业报告网站的交互体验
 */
function enhanceReportSite() {
  // 添加表格行悬停效果
  addTableHoverEffect();
  
  // 添加平滑滚动到锚点
  addSmoothScrollToAnchors();
  
  // 添加返回顶部按钮
  addBackToTopButton();
  
  // 添加链接点击跟踪
  trackExternalLinks();
  
  // 添加表格搜索功能
  addTableSearch();
}

/**
 * 添加表格行悬停效果
 */
function addTableHoverEffect() {
  const tables = document.querySelectorAll('.products-report-site table');
  
  tables.forEach(table => {
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        row.style.backgroundColor = '#f0f7ff';
      });
      
      row.addEventListener('mouseleave', () => {
        row.style.backgroundColor = '';
      });
    });
  });
}

/**
 * 添加平滑滚动到锚点
 */
function addSmoothScrollToAnchors() {
  const links = document.querySelectorAll('.products-report-site a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 添加返回顶部按钮
 */
function addBackToTopButton() {
  // 创建按钮元素
  const backToTopButton = document.createElement('button');
  backToTopButton.innerHTML = '↑';
  backToTopButton.className = 'back-to-top-button';
  backToTopButton.title = '返回顶部';
  
  // 添加样式
  backToTopButton.style.position = 'fixed';
  backToTopButton.style.bottom = '20px';
  backToTopButton.style.right = '20px';
  backToTopButton.style.width = '40px';
  backToTopButton.style.height = '40px';
  backToTopButton.style.borderRadius = '50%';
  backToTopButton.style.backgroundColor = '#3178c6';
  backToTopButton.style.color = 'white';
  backToTopButton.style.border = 'none';
  backToTopButton.style.fontSize = '20px';
  backToTopButton.style.cursor = 'pointer';
  backToTopButton.style.display = 'none';
  backToTopButton.style.zIndex = '1000';
  backToTopButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
  
  // 添加到文档
  document.body.appendChild(backToTopButton);
  
  // 添加点击事件
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // 控制按钮显示/隐藏
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.style.display = 'block';
    } else {
      backToTopButton.style.display = 'none';
    }
  });
}

/**
 * 跟踪外部链接点击
 */
function trackExternalLinks() {
  const externalLinks = document.querySelectorAll('.products-report-site a[href^="http"]');
  
  externalLinks.forEach(link => {
    // 添加新窗口打开属性
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    
    // 添加点击事件
    link.addEventListener('click', function(e) {
      // 如果有分析工具，可以在这里添加跟踪代码
      console.log('External link clicked:', this.href);
    });
  });
}

/**
 * 添加表格搜索功能
 */
function addTableSearch() {
  const reportSite = document.querySelector('.products-report-site');
  if (!reportSite) return;
  
  // 创建搜索框
  const searchContainer = document.createElement('div');
  searchContainer.className = 'report-search-container';
  searchContainer.style.margin = '20px 0';
  searchContainer.style.padding = '15px';
  searchContainer.style.backgroundColor = '#f8f9fa';
  searchContainer.style.borderRadius = '8px';
  searchContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = '搜索行业报告网站...';
  searchInput.className = 'report-search-input';
  searchInput.style.width = '100%';
  searchInput.style.padding = '10px 15px';
  searchInput.style.border = '1px solid #ddd';
  searchInput.style.borderRadius = '4px';
  searchInput.style.fontSize = '16px';
  searchInput.style.boxSizing = 'border-box';
  
  searchContainer.appendChild(searchInput);
  
  // 添加搜索结果计数
  const searchResults = document.createElement('div');
  searchResults.className = 'report-search-results';
  searchResults.style.marginTop = '10px';
  searchResults.style.fontSize = '14px';
  searchResults.style.color = '#666';
  searchContainer.appendChild(searchResults);
  
  // 插入到第一个标题后面
  const firstHeading = reportSite.querySelector('h1');
  if (firstHeading && firstHeading.nextElementSibling) {
    reportSite.insertBefore(searchContainer, firstHeading.nextElementSibling.nextElementSibling);
  } else {
    reportSite.prepend(searchContainer);
  }
  
  // 添加搜索功能
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const tables = reportSite.querySelectorAll('table');
    let totalMatches = 0;
    
    tables.forEach(table => {
      const rows = table.querySelectorAll('tbody tr');
      let tableMatches = 0;
      
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const match = text.includes(searchTerm);
        
        if (match) {
          row.style.display = '';
          tableMatches++;
          totalMatches++;
          
          // 高亮匹配文本
          if (searchTerm.length > 0) {
            highlightText(row, searchTerm);
          } else {
            // 移除高亮
            removeHighlight(row);
          }
        } else {
          row.style.display = 'none';
        }
      });
      
      // 显示/隐藏表格标题
      const tableHeading = table.closest('section').querySelector('h2, h3');
      if (tableHeading) {
        tableHeading.style.display = (tableMatches > 0 || searchTerm === '') ? '' : 'none';
      }
    });
    
    // 更新搜索结果
    if (searchTerm === '') {
      searchResults.textContent = '';
    } else {
      searchResults.textContent = `找到 ${totalMatches} 个匹配结果`;
    }
  });
}

/**
 * 高亮文本
 */
function highlightText(element, searchTerm) {
  removeHighlight(element);
  
  const cells = element.querySelectorAll('td');
  cells.forEach(cell => {
    const originalText = cell.textContent;
    const lowerText = originalText.toLowerCase();
    const index = lowerText.indexOf(searchTerm.toLowerCase());
    
    if (index >= 0) {
      const before = originalText.substring(0, index);
      const match = originalText.substring(index, index + searchTerm.length);
      const after = originalText.substring(index + searchTerm.length);
      
      cell.innerHTML = before + 
        `<span style="background-color: #ffeb3b; font-weight: bold;">${match}</span>` + 
        after;
    }
  });
}

/**
 * 移除高亮
 */
function removeHighlight(element) {
  const cells = element.querySelectorAll('td');
  cells.forEach(cell => {
    const highlightedSpans = cell.querySelectorAll('span[style*="background-color"]');
    if (highlightedSpans.length > 0) {
      cell.textContent = cell.textContent;
    }
  });
}