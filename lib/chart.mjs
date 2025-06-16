import axios from 'axios';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const CHART_CONFIG = {
    dimensions: {
        width: 1920,
        height: 1080,
        aspectRatio: 16/9,
        defaultWidth: 1920,
        defaultHeight: 1080,
        scaleFactor: 1,
        calculateDimensions(screenWidth) {
            this.scaleFactor = Math.min(screenWidth / this.defaultWidth, 1);
            this.width = Math.max(Math.floor(this.defaultWidth * this.scaleFactor), 320);
            this.height = Math.max(Math.floor(this.width / this.aspectRatio), 180);
            return { width: this.width, height: this.height };
        }
    },
    colors: {
        background: '#1a1a1a',
        line: 'rgb(0, 255, 127)',
        grid: 'rgba(255, 255, 255, 0.15)',
        text: '#ffffff'
    },
    fonts: {
        title: {
            size: 32,
            weight: 'bold'
        }
    }
};

const getResponsiveDimensions = (screenWidth = 1920) => {
    return CHART_CONFIG.dimensions.calculateDimensions(screenWidth);
};

const createCanvas = (screenWidth) => {
    const { width, height } = getResponsiveDimensions(screenWidth);
    return new ChartJSNodeCanvas({ 
        width, 
        height, 
        backgroundColour: CHART_CONFIG.colors.background,
        chartCallback: (ChartJS) => {
            ChartJS.defaults.font.family = 'DM Sans';
            ChartJS.defaults.elements.point.radius = 2;
            ChartJS.defaults.elements.line.borderWidth = 3;
        }
    });
};

const canvas = createCanvas();

const timeframes = {
    '1min':  { limit: 1,    interval: 'histominute', format: 'HH:mm',    aggregation: 1 },
    '5min':  { limit: 5,    interval: 'histominute', format: 'HH:mm',    aggregation: 5 },
    '15min': { limit: 15,   interval: 'histominute', format: 'HH:mm',    aggregation: 15 },
    '30min': { limit: 30,   interval: 'histominute', format: 'HH:mm',    aggregation: 30 },
    '1hr':   { limit: 1,    interval: 'histohour',   format: 'HH:mm',    aggregation: 1 },
    '24hr':  { limit: 24,   interval: 'histohour',   format: 'HH:mm',    aggregation: 1 },
    '1d':    { limit: 24,   interval: 'histohour',   format: 'MM/DD',    aggregation: 24 },
    '3d':    { limit: 72,   interval: 'histohour',   format: 'MM/DD',    aggregation: 24 },
    '7d':    { limit: 168,  interval: 'histohour',   format: 'MM/DD',    aggregation: 24 },
    '90d':   { limit: 90,   interval: 'histoday',    format: 'MM/DD',    aggregation: 1 },
    '180d':  { limit: 180,  interval: 'histoday',    format: 'MM/DD',    aggregation: 1 },
    '1yr':   { limit: 365,  interval: 'histoday',    format: 'MM/DD/YY', aggregation: 1 },
    '5yr':   { limit: 1825, interval: 'histoday',    format: 'MM/DD/YY', aggregation: 7 }
};

const formatDate = (date, format) => {
    return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        month: '2-digit',
        day: '2-digit',
        year: format.includes('YY') ? '2-digit' : undefined,
        timeZone: 'UTC'
    });
};

const createChartConfig = (labels, prices, symbol, currency, timeframe) => {
    const scaleFactor = CHART_CONFIG.dimensions.scaleFactor;
    return {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `${symbol}/${currency} - ${timeframe}`,
                data: prices,
                borderColor: CHART_CONFIG.colors.line,
                backgroundColor: CHART_CONFIG.colors.line + '20',
                fill: true,
                tension: 0.2,
                pointRadius: 0,
                pointHitRadius: 20 * scaleFactor,
                borderWidth: 3 * scaleFactor
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: true,
                    text: `Price Chart: ${symbol}/${currency} (${timeframe})`,
                    color: CHART_CONFIG.colors.text,
                    font: {
                        size: CHART_CONFIG.fonts.title.size * scaleFactor,
                        weight: CHART_CONFIG.fonts.title.weight
                    },
                    padding: 20 * scaleFactor
                },
                legend: {
                    labels: { 
                        color: CHART_CONFIG.colors.text,
                        font: {
                            size: 16 * scaleFactor
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    titleFont: {
                        size: 16 * scaleFactor
                    },
                    bodyFont: {
                        size: 14 * scaleFactor
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: CHART_CONFIG.colors.grid },
                    ticks: { 
                        color: CHART_CONFIG.colors.text,
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 12,
                        font: {
                            size: 14 * scaleFactor
                        }
                    }
                },
                y: {
                    grid: { color: CHART_CONFIG.colors.grid },
                    ticks: { 
                        color: CHART_CONFIG.colors.text,
                        callback: (value) => `$${value.toLocaleString()}`,
                        font: {
                            size: 14 * scaleFactor
                        }
                    }
                }
            }
        }
    };
};

export const getCryptoChart = async (symbol = "BTC", currency = "USDT", timeframe = "24hr", screenWidth) => {
    if (!timeframes[timeframe]) {
        const validTimeframes = Object.keys(timeframes).join(', ');
        return `✖️ Invalid timeframe. Please use: ${validTimeframes}`;
    }

    if (!symbol || !currency) {
        return "✖️ Both symbol and currency are required.";
    }

    const { limit, interval, format } = timeframes[timeframe];
    const url = `${process.env.API_URI}/data/v2/${interval}?fsym=${symbol.toUpperCase()}&tsym=${currency.toUpperCase()}&limit=${limit}`;

    try {
        const response = await axios.get(url, { timeout: 5000 });
        
        if (response.data.Response === "Error") {
            return { error: `${symbol}-${currency} pair is not available.` };
        }

        const data = response.data.Data.Data;
        if (!data || data.length === 0) {
            return { error: "No data available for the specified parameters." };
        }

        const labels = data.map(point => formatDate(new Date(point.time * 1000), format));
        const prices = data.map(point => point.close);

        const responsiveCanvas = createCanvas(screenWidth);
        const config = createChartConfig(labels, prices, symbol.toUpperCase(), currency.toUpperCase(), timeframe);
        const image = await responsiveCanvas.renderToBuffer(config);
        
        return { image };
    } catch (error) {
        console.error('Chart generation error:', error);
        return "✖️ Unable to generate chart at this time. Please try again later.";
    }
};

export const __test__ = { timeframes, CHART_CONFIG, formatDate, createChartConfig };
