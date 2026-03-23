/**
 * POD Design Studio - Storefront JavaScript
 * Canvas-based design tool for customers
 */

(function() {
  'use strict';

  // ============================================
  // Configuration & State
  // ============================================
  const config = window.PODDesignStudio?.config || {};
  
  const state = {
    canvas: null,
    ctx: null,
    elements: [],
    selectedElement: null,
    currentTool: 'select',
    zoom: 1,
    history: [],
    historyIndex: -1,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    currentTab: 'upload',
    selectedColor: config.colors?.[0]?.hex || '#000000',
    selectedSize: config.sizes?.[2] || 'M',
    quantity: 1,
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    canvas: document.getElementById('pod-canvas'),
    fileInput: document.getElementById('pod-file-input'),
    uploadZone: document.getElementById('pod-upload-zone'),
    layersList: document.getElementById('pod-layers-list'),
    addTextBtn: document.getElementById('pod-add-text'),
    textContent: document.getElementById('pod-text-content'),
    fontFamily: document.getElementById('pod-font-family'),
    fontSize: document.getElementById('pod-font-size'),
    textColor: document.getElementById('pod-text-color'),
    quantityInput: document.getElementById('pod-quantity'),
    addToCartBtn: document.getElementById('pod-add-to-cart'),
    totalPrice: document.getElementById('pod-total-price'),
  };

  // ============================================
  // Initialization
  // ============================================
  function init() {
    if (!elements.canvas) return;
    
    initCanvas();
    initEventListeners();
    initTabs();
    initColorSelection();
    initSizeSelection();
    initQuantityControls();
    initToolbar();
    
    // Load initial state
    saveState();
    
    console.log('POD Design Studio initialized');
  }

  function initCanvas() {
    const container = elements.canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    // Set canvas size
    const width = Math.min(500, containerRect.width - 40);
    const height = width * 1.2;
    
    elements.canvas.width = width;
    elements.canvas.height = height;
    elements.canvas.style.width = width + 'px';
    elements.canvas.style.height = height + 'px';
    
    state.ctx = elements.canvas.getContext('2d');
    
    // Initial render
    render();
  }

  // ============================================
  // Event Listeners
  // ============================================
  function initEventListeners() {
    // File upload
    if (elements.fileInput) {
      elements.fileInput.addEventListener('change', handleFileUpload);
    }
    
    if (elements.uploadZone) {
      elements.uploadZone.addEventListener('dragover', handleDragOver);
      elements.uploadZone.addEventListener('dragleave', handleDragLeave);
      elements.uploadZone.addEventListener('drop', handleDrop);
    }
    
    // Canvas interactions
    elements.canvas.addEventListener('mousedown', handleCanvasMouseDown);
    elements.canvas.addEventListener('mousemove', handleCanvasMouseMove);
    elements.canvas.addEventListener('mouseup', handleCanvasMouseUp);
    elements.canvas.addEventListener('wheel', handleCanvasWheel);
    
    // Text controls
    if (elements.addTextBtn) {
      elements.addTextBtn.addEventListener('click', addTextElement);
    }
    
    // Add to cart
    if (elements.addToCartBtn) {
      elements.addToCartBtn.addEventListener('click', handleAddToCart);
    }
  }

  // ============================================
  // File Upload
  // ============================================
  function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    files.forEach(processFile);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadZone.classList.add('dragover');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadZone.classList.remove('dragover');
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.uploadZone.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  }

  function processFile(file) {
    // Validate file
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      showToast('File too large. Max 20MB.', 'error');
      return;
    }
    
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid file type. Use PNG, JPG, or SVG.', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        addImageElement(img, file.name);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ============================================
  // Canvas Elements
  // ============================================
  function addImageElement(img, filename) {
    const canvasWidth = elements.canvas.width;
    const canvasHeight = elements.canvas.height;
    
    // Scale image to fit within print area
    const maxWidth = canvasWidth * 0.6;
    const maxHeight = canvasHeight * 0.6;
    
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }
    
    const element = {
      id: Date.now(),
      type: 'image',
      src: img.src,
      img: img,
      x: (canvasWidth - width) / 2,
      y: (canvasHeight - height) / 2,
      width: width,
      height: height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      filename: filename,
    };
    
    state.elements.push(element);
    selectElement(element);
    saveState();
    render();
    updateLayersList();
    
    showToast('Image added successfully');
  }

  function addTextElement() {
    const text = elements.textContent?.value?.trim();
    if (!text) {
      showToast('Please enter some text', 'error');
      return;
    }
    
    const canvasWidth = elements.canvas.width;
    const canvasHeight = elements.canvas.height;
    
    const fontSize = parseInt(elements.fontSize?.value) || 24;
    const fontFamily = elements.fontFamily?.value || 'Arial';
    const color = elements.textColor?.value || '#000000';
    
    const element = {
      id: Date.now(),
      type: 'text',
      text: text,
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      fontSize: fontSize,
      fontFamily: fontFamily,
      color: color,
      rotation: 0,
      textAlign: 'center',
      bold: document.querySelector('[data-style="bold"]')?.classList.contains('active'),
      italic: document.querySelector('[data-style="italic"]')?.classList.contains('active'),
      underline: document.querySelector('[data-style="underline"]')?.classList.contains('active'),
    };
    
    // Calculate text width
    state.ctx.font = `${element.bold ? 'bold ' : ''}${element.italic ? 'italic ' : ''}${fontSize}px ${fontFamily}`;
    const metrics = state.ctx.measureText(text);
    element.width = metrics.width;
    element.height = fontSize;
    
    state.elements.push(element);
    selectElement(element);
    saveState();
    render();
    updateLayersList();
    
    // Clear text input
    if (elements.textContent) {
      elements.textContent.value = '';
    }
    
    showToast('Text added successfully');
  }

  function selectElement(element) {
    state.selectedElement = element;
    render();
  }

  function deleteElement(element) {
    const index = state.elements.indexOf(element);
    if (index > -1) {
      state.elements.splice(index, 1);
      state.selectedElement = null;
      saveState();
      render();
      updateLayersList();
    }
  }

  // ============================================
  // Canvas Rendering
  // ============================================
  function render() {
    const ctx = state.ctx;
    const canvas = elements.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom
    ctx.save();
    ctx.scale(state.zoom, state.zoom);
    
    // Draw print area guides
    drawPrintAreaGuides(ctx);
    
    // Draw elements
    state.elements.forEach((element) => {
      ctx.save();
      
      if (element.type === 'image') {
        drawImageElement(ctx, element);
      } else if (element.type === 'text') {
        drawTextElement(ctx, element);
      }
      
      ctx.restore();
    });
    
    // Draw selection box
    if (state.selectedElement) {
      drawSelectionBox(ctx, state.selectedElement);
    }
    
    ctx.restore();
  }

  function drawPrintAreaGuides(ctx) {
    const printAreas = config.printAreas || [];
    
    printAreas.forEach((area) => {
      if (!area.enabled) return;
      
      ctx.save();
      ctx.strokeStyle = '#1976D2';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1;
      ctx.strokeRect(area.x, area.y, area.width, area.height);
      
      // Draw label
      ctx.fillStyle = '#1976D2';
      ctx.font = '11px sans-serif';
      ctx.fillText(area.name, area.x, area.y - 5);
      ctx.restore();
    });
  }

  function drawImageElement(ctx, element) {
    ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.scale(element.scaleX, element.scaleY);
    
    ctx.drawImage(
      element.img,
      -element.width / 2,
      -element.height / 2,
      element.width,
      element.height
    );
  }

  function drawTextElement(ctx, element) {
    ctx.translate(element.x, element.y);
    ctx.rotate((element.rotation * Math.PI) / 180);
    
    const fontStyle = `${element.bold ? 'bold ' : ''}${element.italic ? 'italic ' : ''}`;
    ctx.font = `${fontStyle}${element.fontSize}px ${element.fontFamily}`;
    ctx.fillStyle = element.color;
    ctx.textAlign = element.textAlign;
    ctx.textBaseline = 'middle';
    
    ctx.fillText(element.text, 0, 0);
    
    if (element.underline) {
      const metrics = ctx.measureText(element.text);
      ctx.beginPath();
      ctx.moveTo(-metrics.width / 2, element.fontSize / 2 + 2);
      ctx.lineTo(metrics.width / 2, element.fontSize / 2 + 2);
      ctx.strokeStyle = element.color;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawSelectionBox(ctx, element) {
    ctx.save();
    ctx.strokeStyle = '#1976D2';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    let x, y, width, height;
    
    if (element.type === 'image') {
      x = element.x;
      y = element.y;
      width = element.width * element.scaleX;
      height = element.height * element.scaleY;
      
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.strokeRect(-width / 2, -height / 2, width, height);
    } else {
      x = element.x - element.width / 2;
      y = element.y - element.height / 2;
      width = element.width;
      height = element.height;
      
      ctx.translate(element.x, element.y);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.strokeRect(-width / 2, -height / 2, width, height);
    }
    
    // Draw resize handles
    const handleSize = 8;
    ctx.fillStyle = '#1976D2';
    
    const handles = [
      { x: -width / 2 - handleSize / 2, y: -height / 2 - handleSize / 2 },
      { x: width / 2 - handleSize / 2, y: -height / 2 - handleSize / 2 },
      { x: width / 2 - handleSize / 2, y: height / 2 - handleSize / 2 },
      { x: -width / 2 - handleSize / 2, y: height / 2 - handleSize / 2 },
    ];
    
    handles.forEach((handle) => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
    });
    
    ctx.restore();
  }

  // ============================================
  // Canvas Interactions
  // ============================================
  function handleCanvasMouseDown(e) {
    const rect = elements.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.zoom;
    const y = (e.clientY - rect.top) / state.zoom;
    
    // Check if clicking on an element
    const clickedElement = getElementAt(x, y);
    
    if (clickedElement) {
      selectElement(clickedElement);
      state.isDragging = true;
      state.dragStart = { x, y };
    } else {
      state.selectedElement = null;
      render();
    }
  }

  function handleCanvasMouseMove(e) {
    if (!state.isDragging || !state.selectedElement) return;
    
    const rect = elements.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.zoom;
    const y = (e.clientY - rect.top) / state.zoom;
    
    const dx = x - state.dragStart.x;
    const dy = y - state.dragStart.y;
    
    state.selectedElement.x += dx;
    state.selectedElement.y += dy;
    
    state.dragStart = { x, y };
    render();
  }

  function handleCanvasMouseUp() {
    if (state.isDragging) {
      state.isDragging = false;
      saveState();
    }
  }

  function handleCanvasWheel(e) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    state.zoom = Math.max(0.5, Math.min(3, state.zoom * delta));
    
    render();
  }

  function getElementAt(x, y) {
    // Check in reverse order (top to bottom)
    for (let i = state.elements.length - 1; i >= 0; i--) {
      const element = state.elements[i];
      
      if (element.type === 'image') {
        const halfWidth = (element.width * element.scaleX) / 2;
        const halfHeight = (element.height * element.scaleY) / 2;
        
        if (
          x >= element.x &&
          x <= element.x + element.width * element.scaleX &&
          y >= element.y &&
          y <= element.y + element.height * element.scaleY
        ) {
          return element;
        }
      } else if (element.type === 'text') {
        const halfWidth = element.width / 2;
        const halfHeight = element.height / 2;
        
        if (
          x >= element.x - halfWidth &&
          x <= element.x + halfWidth &&
          y >= element.y - halfHeight &&
          y <= element.y + halfHeight
        ) {
          return element;
        }
      }
    }
    
    return null;
  }

  // ============================================
  // Toolbar
  // ============================================
  function initToolbar() {
    const toolbar = document.querySelector('.pod-design-studio__toolbar');
    if (!toolbar) return;
    
    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.pod-design-studio__tool-btn');
      if (!btn) return;
      
      const tool = btn.dataset.tool;
      handleToolAction(tool);
      
      // Update active state
      toolbar.querySelectorAll('.pod-design-studio__tool-btn').forEach((b) => {
        b.classList.remove('active');
      });
      btn.classList.add('active');
    });
  }

  function handleToolAction(tool) {
    switch (tool) {
      case 'select':
        state.currentTool = 'select';
        break;
      case 'move':
        state.currentTool = 'move';
        break;
      case 'zoom-in':
        state.zoom = Math.min(3, state.zoom * 1.2);
        render();
        break;
      case 'zoom-out':
        state.zoom = Math.max(0.5, state.zoom / 1.2);
        render();
        break;
      case 'undo':
        undo();
        break;
      case 'redo':
        redo();
        break;
      case 'delete':
        if (state.selectedElement) {
          deleteElement(state.selectedElement);
          showToast('Element deleted');
        }
        break;
    }
  }

  // ============================================
  // History (Undo/Redo)
  // ============================================
  function saveState() {
    // Remove future states if we're not at the end
    if (state.historyIndex < state.history.length - 1) {
      state.history = state.history.slice(0, state.historyIndex + 1);
    }
    
    // Save current state
    const snapshot = JSON.parse(JSON.stringify(state.elements));
    state.history.push(snapshot);
    state.historyIndex++;
    
    // Limit history size
    if (state.history.length > 50) {
      state.history.shift();
      state.historyIndex--;
    }
  }

  function undo() {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      state.elements = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      state.selectedElement = null;
      render();
      updateLayersList();
    }
  }

  function redo() {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex++;
      state.elements = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      state.selectedElement = null;
      render();
      updateLayersList();
    }
  }

  // ============================================
  // Tabs
  // ============================================
  function initTabs() {
    const tabs = document.querySelectorAll('.pod-design-studio__tab');
    const contents = document.querySelectorAll('.pod-design-studio__tab-content');
    
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update tabs
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update content
        contents.forEach((c) => {
          c.classList.toggle('active', c.dataset.tabContent === tabName);
        });
        
        state.currentTab = tabName;
      });
    });
  }

  // ============================================
  // Layers List
  // ============================================
  function updateLayersList() {
    if (!elements.layersList) return;
    
    if (state.elements.length === 0) {
      elements.layersList.innerHTML = '<p class="pod-design-studio__empty-state">No layers yet. Add images or text to get started.</p>';
      return;
    }
    
    elements.layersList.innerHTML = state.elements
      .slice()
      .reverse()
      .map((element, index) => {
        const isSelected = state.selectedElement === element;
        const icon = element.type === 'image' ? '🖼️' : '📝';
        const name = element.type === 'image' ? element.filename : element.text.substring(0, 20);
        
        return `
          <div class="pod-design-studio__layer ${isSelected ? 'active' : ''}" data-element-id="${element.id}">
            <span class="pod-design-studio__layer-icon">${icon}</span>
            <span class="pod-design-studio__layer-name">${name}</span>
            <button class="pod-design-studio__layer-delete" data-element-id="${element.id}">×</button>
          </div>
        `;
      })
      .join('');
    
    // Add click handlers
    elements.layersList.querySelectorAll('.pod-design-studio__layer').forEach((layer) => {
      layer.addEventListener('click', () => {
        const elementId = parseInt(layer.dataset.elementId);
        const element = state.elements.find((e) => e.id === elementId);
        if (element) {
          selectElement(element);
          updateLayersList();
        }
      });
    });
    
    elements.layersList.querySelectorAll('.pod-design-studio__layer-delete').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const elementId = parseInt(btn.dataset.elementId);
        const element = state.elements.find((e) => e.id === elementId);
        if (element) {
          deleteElement(element);
        }
      });
    });
  }

  // ============================================
  // Product Options
  // ============================================
  function initColorSelection() {
    const colorBtns = document.querySelectorAll('.pod-design-studio__color-btn');
    
    colorBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        colorBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        
        state.selectedColor = btn.dataset.color;
        
        // Update mockup image if available
        const mockupImg = document.getElementById('pod-mockup-image');
        if (mockupImg) {
          // In real implementation, this would switch to the appropriate color variant image
          console.log('Color changed to:', state.selectedColor);
        }
      });
    });
  }

  function initSizeSelection() {
    const sizeBtns = document.querySelectorAll('.pod-design-studio__size-btn');
    
    sizeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        
        state.selectedSize = btn.dataset.size;
      });
    });
  }

  function initQuantityControls() {
    const decreaseBtn = document.querySelector('[data-action="decrease"]');
    const increaseBtn = document.querySelector('[data-action="increase"]');
    
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => {
        if (state.quantity > 1) {
          state.quantity--;
          updateQuantityDisplay();
        }
      });
    }
    
    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => {
        if (state.quantity < 100) {
          state.quantity++;
          updateQuantityDisplay();
        }
      });
    }
    
    if (elements.quantityInput) {
      elements.quantityInput.addEventListener('change', () => {
        state.quantity = Math.max(1, Math.min(100, parseInt(elements.quantityInput.value) || 1));
        updateQuantityDisplay();
      });
    }
  }

  function updateQuantityDisplay() {
    if (elements.quantityInput) {
      elements.quantityInput.value = state.quantity;
    }
    updateTotalPrice();
  }

  function updateTotalPrice() {
    const basePrice = parseFloat(elements.totalPrice?.dataset.basePrice) || 0;
    const fee = parseFloat(elements.totalPrice?.dataset.fee) || 0;
    const total = (basePrice + fee) * state.quantity;
    
    if (elements.totalPrice) {
      elements.totalPrice.textContent = formatMoney(total);
    }
    
    const cartPrice = document.querySelector('.pod-design-studio__cart-price');
    if (cartPrice) {
      cartPrice.textContent = formatMoney(total);
    }
  }

  function formatMoney(cents) {
    const dollars = (cents / 100).toFixed(2);
    return '$' + dollars;
  }

  // ============================================
  // Add to Cart
  // ============================================
  async function handleAddToCart() {
    if (state.elements.length === 0) {
      showToast('Please add a design first', 'error');
      return;
    }
    
    elements.addToCartBtn.disabled = true;
    elements.addToCartBtn.innerHTML = '<span class="pod-design-studio__spinner"></span>';
    
    try {
      // Generate design data
      const designData = {
        productId: config.productId,
        color: state.selectedColor,
        size: state.selectedSize,
        elements: state.elements.map((e) => ({
          type: e.type,
          x: e.x,
          y: e.y,
          width: e.width,
          height: e.height,
          rotation: e.rotation,
          ...(e.type === 'text' && {
            text: e.text,
            fontFamily: e.fontFamily,
            fontSize: e.fontSize,
            color: e.color,
          }),
          ...(e.type === 'image' && {
            filename: e.filename,
          }),
        })),
      };
      
      // Generate preview image
      const previewDataUrl = await generatePreviewImage();
      
      // Generate print files
      const printFiles = await generatePrintFiles();
      
      // Add to Shopify cart
      await addToShopifyCart(designData, previewDataUrl, printFiles);
      
      showToast('Added to cart successfully!');
      
    } catch (error) {
      console.error('Add to cart failed:', error);
      showToast('Failed to add to cart. Please try again.', 'error');
    } finally {
      elements.addToCartBtn.disabled = false;
      elements.addToCartBtn.innerHTML = `
        <span class="pod-design-studio__cart-text">Add to Cart</span>
        <span class="pod-design-studio__cart-price">${formatMoney((config.basePrice + config.customizationFee) * state.quantity)}</span>
      `;
    }
  }

  function generatePreviewImage() {
    return new Promise((resolve) => {
      // Create a temporary canvas for the preview
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 400;
      tempCanvas.height = 480;
      const ctx = tempCanvas.getContext('2d');
      
      // Draw design elements
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Scale and draw elements
      const scaleX = tempCanvas.width / elements.canvas.width;
      const scaleY = tempCanvas.height / elements.canvas.height;
      
      state.elements.forEach((element) => {
        ctx.save();
        ctx.translate(element.x * scaleX, element.y * scaleY);
        ctx.rotate((element.rotation * Math.PI) / 180);
        
        if (element.type === 'image') {
          ctx.drawImage(
            element.img,
            (-element.width / 2) * scaleX,
            (-element.height / 2) * scaleY,
            element.width * scaleX,
            element.height * scaleY
          );
        } else if (element.type === 'text') {
          const fontStyle = `${element.bold ? 'bold ' : ''}${element.italic ? 'italic ' : ''}`;
          ctx.font = `${fontStyle}${element.fontSize * scaleY}px ${element.fontFamily}`;
          ctx.fillStyle = element.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.text, 0, 0);
        }
        
        ctx.restore();
      });
      
      resolve(tempCanvas.toDataURL('image/png'));
    });
  }

  async function generatePrintFiles() {
    // In real implementation, this would:
    // 1. Generate high-resolution PNG (300 DPI)
    // 2. Generate PDF with proper print settings
    // 3. Upload to storage and return URLs
    
    return {
      png: 'placeholder-png-url',
      pdf: 'placeholder-pdf-url',
    };
  }

  async function addToShopifyCart(designData, previewUrl, printFiles) {
    const variantId = elements.addToCartBtn?.dataset.variantId;
    
    if (!variantId) {
      throw new Error('No variant ID found');
    }
    
    const formData = {
      items: [
        {
          id: variantId,
          quantity: state.quantity,
          properties: {
            '_pod_design_data': JSON.stringify(designData),
            '_pod_design_preview': previewUrl,
            '_pod_print_files': JSON.stringify(printFiles),
            '_pod_color': state.selectedColor,
            '_pod_size': state.selectedSize,
          },
        },
      ],
    };
    
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      throw new Error('Cart add failed');
    }
    
    return response.json();
  }

  // ============================================
  // Toast Notifications
  // ============================================
  function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.pod-design-studio__toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `pod-design-studio__toast pod-design-studio__toast--${type}`;
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success' 
          ? '<path d="M20 6L9 17l-5-5"/>' 
          : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
        }
      </svg>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ============================================
  // Initialize
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
