import { useEffect, useId } from 'react';
import * as roughViz from 'rough-viz';
import "./CrecimientoChart.css"

interface CrecimientoChartProps {
  chartData: {
    anios: string[];
    dinero: number[];
  };
}

export const CrecimientoChart = ({ chartData }: CrecimientoChartProps) => {
  const reactId = useId();
  const containerId = `crecimiento-chart-${reactId.replace(/:/g, '')}`;
  const sampleStep = Math.max(1, Math.ceil(chartData.dinero.length / 14));
  const sampleIndexes = chartData.dinero
    .map((_, index) => index)
    .filter((index) => index % sampleStep === 0 || index === chartData.dinero.length - 1);
  const years = sampleIndexes.map((index) => chartData.anios[index]);
  const patrimonio = sampleIndexes.map((index) => chartData.dinero[index]);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container || years.length === 0 || patrimonio.length === 0) return;

    container.innerHTML = '';

    // rough-viz registers an anonymous window resize listener and has no
    // lifecycle cleanup for it. Capture that listener so it can be removed
    // when this chart unmounts or its data changes.
    const resizeListeners: EventListenerOrEventListenerObject[] = [];
    const originalAddEventListener = window.addEventListener;
    const captureAddEventListener = (
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions,
    ) => {
      if (type === 'resize' && listener) resizeListeners.push(listener);
      return originalAddEventListener.call(window, type, listener as EventListener, options);
    };

    window.addEventListener = captureAddEventListener as typeof window.addEventListener;
    try {
      new roughViz.Line({
        element: `#${containerId}`,
        data: { patrimonio },
        x: years,
        title: 'Crecimiento de tu Patrimonio',
        xLabel: 'Año',
        yLabel: 'Patrimonio (USD)',
        yValueFormat: ',.2s',
        colors: ['#087f8c'],
        roughness: 0.35,
        strokeWidth: 2.5,
        circleRadius: 4,
        legend: false,
        axisFontSize: '0.78rem',
        labelFontSize: '0.9rem',
        titleFontSize: '18px',
        margin: { top: 54, right: 28, bottom: 82, left: 88 },
      });
    } finally {
      window.addEventListener = originalAddEventListener;
    }

    return () => {
      resizeListeners.forEach((listener) => window.removeEventListener('resize', listener));
      container.innerHTML = '';
    };
  }, [containerId, patrimonio, years]);

  if (chartData.anios.length === 0 || chartData.dinero.length === 0) {
    return <div className="chart-empty-state">Todavía no hay años registrados en este historial.</div>;
  }

  return <div id={containerId} className="chart-container" />;
};
