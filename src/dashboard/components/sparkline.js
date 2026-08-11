/**
 * Sparkline Component
 * Minimal SVG-based line chart for KPI trend visualization
 * Lightweight implementation for weekly data display
 */

class Sparkline {
  constructor() {
    this.defaultOptions = {
      width: 120,
      height: 40,
      color: '#C9A200',
      strokeWidth: 2,
      showDots: false,
      smooth: true,
      animate: true,
      padding: {
        top: 4,
        right: 4,
        bottom: 4,
        left: 4
      }
    };
  }

  render(config = {}) {
    const options = { ...this.defaultOptions, ...config };
    const { data, width, height, color, strokeWidth, showDots, smooth, animate, padding } = options;

    if (!data || !Array.isArray(data) || data.length < 2) {
      return this.renderEmptyState();
    }

    const svgId = `sparkline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Prepare data points
    const points = this.prepareDataPoints(data, chartWidth, chartHeight, padding);
    const pathData = this.generatePath(points, smooth);

    return `
      <svg id="${svgId}"
           class="sparkline-svg"
           width="${width}"
           height="${height}"
           viewBox="0 0 ${width} ${height}"
           xmlns="http://www.w3.org/2000/svg"
           role="img"
           aria-label="Biểu đồ xu hướng ${data.length} điểm dữ liệu">

        <defs>
          <linearGradient id="sparkline-gradient-${svgId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0.05" />
          </linearGradient>
        </defs>

        <!-- Background area fill -->
        ${this.generateAreaPath(points, height, padding, `sparkline-gradient-${svgId}`)}

        <!-- Main line -->
        <path d="${pathData}"
              fill="none"
              stroke="${color}"
              stroke-width="${strokeWidth}"
              stroke-linecap="round"
              stroke-linejoin="round"
              ${animate ? `class="sparkline-animate"` : ''}>
        </path>

        <!-- Data points -->
        ${showDots ? this.generateDots(points, color) : ''}

        <!-- Trend indicators -->
        ${this.generateTrendIndicators(points, color)}
      </svg>
    `;
  }

  prepareDataPoints(data, chartWidth, chartHeight, padding) {
    // Find min/max values for scaling
    const values = data.map(item => typeof item === 'object' ? item.value : item);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1; // Avoid division by zero

    // Generate points
    return data.map((item, index) => {
      const value = typeof item === 'object' ? item.value : item;
      const timestamp = typeof item === 'object' ? item.timestamp : null;

      const x = padding.left + (index / (data.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

      return {
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        value,
        timestamp,
        index
      };
    });
  }

  generatePath(points, smooth) {
    if (!points.length) return '';

    if (smooth && points.length > 2) {
      return this.generateSmoothPath(points);
    } else {
      return this.generateLinearPath(points);
    }
  }

  generateLinearPath(points) {
    const commands = points.map((point, index) => {
      return index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
    });

    return commands.join(' ');
  }

  generateSmoothPath(points) {
    if (points.length < 3) {
      return this.generateLinearPath(points);
    }

    const commands = [];
    commands.push(`M ${points[0].x} ${points[0].y}`);

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];

      if (i === 1) {
        // First curve
        const nextPoint = points[i + 1];
        const cp1x = prevPoint.x + (currentPoint.x - prevPoint.x) * 0.3;
        const cp1y = prevPoint.y;
        const cp2x = currentPoint.x - (nextPoint.x - prevPoint.x) * 0.3;
        const cp2y = currentPoint.y;

        commands.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currentPoint.x} ${currentPoint.y}`);
      } else if (i === points.length - 1) {
        // Last curve
        const beforePrevPoint = points[i - 2];
        const cp1x = prevPoint.x + (currentPoint.x - beforePrevPoint.x) * 0.3;
        const cp1y = prevPoint.y;
        const cp2x = currentPoint.x;
        const cp2y = currentPoint.y;

        commands.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currentPoint.x} ${currentPoint.y}`);
      } else {
        // Middle curves
        const beforePoint = points[i - 2];
        const nextPoint = points[i + 1];
        const cp1x = prevPoint.x + (currentPoint.x - beforePoint.x) * 0.3;
        const cp1y = prevPoint.y;
        const cp2x = currentPoint.x - (nextPoint.x - prevPoint.x) * 0.3;
        const cp2y = currentPoint.y;

        commands.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currentPoint.x} ${currentPoint.y}`);
      }
    }

    return commands.join(' ');
  }

  generateAreaPath(points, height, padding, gradientId) {
    if (!points.length) return '';

    const pathData = this.generatePath(points, true);
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    // Close the area path at the bottom
    const areaPath = `${pathData} L ${lastPoint.x} ${height - padding.bottom} L ${firstPoint.x} ${height - padding.bottom} Z`;

    return `
      <path d="${areaPath}"
            fill="url(#${gradientId})"
            opacity="0.6">
      </path>
    `;
  }

  generateDots(points, color) {
    return points.map(point => `
      <circle cx="${point.x}"
              cy="${point.y}"
              r="2"
              fill="${color}"
              stroke="var(--surface-secondary)"
              stroke-width="1">
        <title>Giá trị: ${point.value}</title>
      </circle>
    `).join('');
  }

  generateTrendIndicators(points, color) {
    if (points.length < 2) return '';

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const trend = lastPoint.value > firstPoint.value ? 'up' : lastPoint.value < firstPoint.value ? 'down' : 'stable';

    // Add small trend arrow at the end
    const arrowSize = 3;
    const arrowX = lastPoint.x + 8;
    const arrowY = lastPoint.y;

    if (trend === 'up') {
      return `
        <polygon points="${arrowX},${arrowY - arrowSize} ${arrowX + arrowSize},${arrowY + arrowSize} ${arrowX - arrowSize},${arrowY + arrowSize}"
                 fill="#00cc66"
                 opacity="0.8">
        </polygon>
      `;
    } else if (trend === 'down') {
      return `
        <polygon points="${arrowX},${arrowY + arrowSize} ${arrowX + arrowSize},${arrowY - arrowSize} ${arrowX - arrowSize},${arrowY - arrowSize}"
                 fill="#ff4444"
                 opacity="0.8">
        </polygon>
      `;
    }

    return '';
  }

  renderEmptyState() {
    return `
      <div class="sparkline-empty" style="
        width: ${this.defaultOptions.width}px;
        height: ${this.defaultOptions.height}px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-tertiary);
        font-size: 0.75rem;
        border: 1px dashed var(--border-secondary);
        border-radius: var(--radius-sm);
      ">
        Chưa có dữ liệu
      </div>
    `;
  }

  // Static method to add required CSS animations
  static addStyles() {
    if (document.getElementById('sparkline-styles')) return;

    const styles = `
      <style id="sparkline-styles">
        .sparkline-svg {
          overflow: visible;
        }

        .sparkline-animate {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: sparkline-draw 1.5s ease-out forwards;
        }

        @keyframes sparkline-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        .sparkline-empty {
          background: var(--surface-tertiary);
        }

        @media (prefers-reduced-motion: reduce) {
          .sparkline-animate {
            animation: none;
            stroke-dasharray: none;
            stroke-dashoffset: 0;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  // Utility method to format sample data for testing
  static generateSampleData(length = 7, min = 0, max = 100) {
    const data = [];
    for (let i = 0; i < length; i++) {
      data.push({
        value: Math.floor(Math.random() * (max - min + 1)) + min,
        timestamp: new Date(Date.now() - (length - i - 1) * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return data;
  }
}

// Auto-initialize styles when module loads
Sparkline.addStyles();

export default Sparkline;